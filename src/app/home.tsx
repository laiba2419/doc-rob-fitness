import AnimatedPressable from '@/components/AnimatedPressable';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import CalendarPickerModal from '@/components/CalendarPickerModal';
import LevelWorkoutPickerModal from '@/components/LevelWorkoutPickerModal';
import { translateList } from '@/lib/translate';
import {
  BodyPart,
  Equipment,
  Exercise,
  fetchBodyParts,
  fetchEquipment,
  fetchExercisesFor,
  fetchUserSchedule,
  fetchWorkoutLevels,
  fetchWorkoutOptions,
  fetchWorkoutTypes,
  removeScheduleForDate,
  setScheduleForDate,
  WorkoutLevel,
  WorkoutOption,
  WorkoutType,
} from '@/services/homeService';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

// Android pe LayoutAnimation by default off hoti hai -- enable karte hain
// taake Workout Types/Levels list expand/collapse smoothly ho, jhatke se nahi.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------- Local images — kept local since these are bundled assets.
// Matched to the database rows by id. ----------
const bodyPartImages: Record<string, any> = {
  leg: require('../../assets/images/body-parts/leg.png'),
  shoulders: require('../../assets/images/body-parts/shoulders.png'),
  biceps: require('../../assets/images/body-parts/Biceps.png'),
  abs: require('../../assets/images/body-parts/abs.png'),
  back: require('../../assets/images/body-parts/Backs.png'),
  triceps: require('../../assets/images/body-parts/Triceps.png'),
  chest: require('../../assets/images/body-parts/Chest.png'),
  quadriceps: require('../../assets/images/body-parts/Quadriceps.png'),
  hamstrings: require('../../assets/images/body-parts/Hamstrings.png'),
  'upper-body': require('../../assets/images/body-parts/upper-body.png'),
};

const equipmentImages: Record<string, any> = {
  dumbbell: require('../../assets/images/equipment/Dumbbells.png'),
  jumprope: require('../../assets/images/equipment/Jumprope.png'),
  kettlebell: require('../../assets/images/equipment/kettlebells.png'),
  bench: require('../../assets/images/equipment/bench.png'),
  barbell: require('../../assets/images/equipment/Barbell.png'),
  gymball: require('../../assets/images/equipment/exercise ball.png'),
  weightplate: require('../../assets/images/equipment/weight plate.png'),
};

const workoutTypeImages: Record<string, any> = {
  'type-1': require('../../assets/images/workout-types/type-1.png'),
  'type-2': require('../../assets/images/workout-types/type-2.png'),
  'type-3': require('../../assets/images/workout-types/type-3.png'),
  'type-4': require('../../assets/images/workout-types/type-4.png'),
  'type-5': require('../../assets/images/workout-types/type-5.png'),
  'type-6': require('../../assets/images/workout-types/type-6.png'),
  'type-7': require('../../assets/images/workout-types/type-7.png'),
};

const workoutLevelImages: Record<string, any> = {
  beginner: require('../../assets/images/levels/beginner.png'),
  'advance-1': require('../../assets/images/levels/advance.png'),
  intermediate: require('../../assets/images/levels/intermediate.png'),
  'advance-2': require('../../assets/images/levels/advance.png'),
  advance: require('../../assets/images/levels/advance.png'),
};

// ✅ Supabase's workout_levels.id comes back as "Beginner" / "Intermediate" /
// "Advance" (capitalized), but the map above uses lowercase keys. Doing a
// case-insensitive lookup here means images resolve correctly regardless of
// how the id is capitalized in the database, instead of silently failing
// and leaving the level cards / banner blank.
function getLevelImage(levelId: string | null | undefined) {
  if (!levelId) return undefined;
  return workoutLevelImages[levelId] ?? workoutLevelImages[levelId.trim().toLowerCase()];
}

const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatShort(d: Date, t: (key: string) => string) {
  return `${t(`months.${monthKeys[d.getMonth()]}`)} ${d.getDate()}`;
}

// ✅ Local date use karta hai (device/Pakistan time), UTC nahi -- isi wajah se
// pehle raat ke waqt galat din dikh raha tha (toISOString() UTC deta hai).
function dateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // ✅ Same profile context jo Profile screen use karti hai. Signup ke
  // baad /setup/details screen jo naam/mobile save karti hai, wahi yahan
  // bhi automatically dikh jaata hai -- koi extra fetch nahi chahiye
  // kyunke context already app-wide shared state hai.
  const { profile } = useUserProfile();
  const displayFirstName = profile.firstName?.trim() || 'there';

  const [search, setSearch] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // ---------- Data fetched from Supabase ----------
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [workoutLevels, setWorkoutLevels] = useState<WorkoutLevel[]>([]);
  const [workoutOptions, setWorkoutOptions] = useState<WorkoutOption[]>([]);
  const [daySchedule, setDaySchedule] = useState<Record<string, string>>({});

  // ✅ tracks which level (beginner/intermediate/advance) was used to
  // schedule a given date, so the banner image below "Schedule" can change
  // to match whatever level the user picked. Persisted permanently via the
  // `level_id` column on user_schedule (see homeService.ts) -- seeded from
  // Supabase on load and kept in sync with every assign/remove below.
  const [dayScheduleLevel, setDayScheduleLevel] = useState<Record<string, string>>({});

  // Every workout/exercise we've ever fetched (workout options + type/level
  // exercises), keyed by id -- so we can always show a title/meta for
  // whatever is scheduled on a day, no matter which section it came from.
  const [allScheduleItems, setAllScheduleItems] = useState<Record<string, { title: string; meta: string }>>({});

  const registerScheduleItems = (items: { id: string; title: string; meta: string }[]) => {
    setAllScheduleItems((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        next[item.id] = { title: item.title, meta: item.meta };
      });
      return next;
    });
  };

  // Exercises for whichever type is currently expanded — fetched on demand
  const [typeExercises, setTypeExercises] = useState<Exercise[]>([]);

  const today = useMemo(() => new Date(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(dateKey(today));

  const weekDates = useMemo(() => {
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [today, weekOffset]);

  const weekRangeLabel = `${formatShort(weekDates[0], t)} - ${formatShort(weekDates[6], t)}, ${weekDates[0].getFullYear()}`;

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [removingSchedule, setRemovingSchedule] = useState(false);

  // ✅ single unified "level -> body parts" flow, used both by "Add a
  // workout" (which starts at the level step) and by the home screen's
  // "Workout Levels" cards (which jump straight to the body-parts step for
  // whichever level was tapped). Same body parts list (from body_parts
  // table) shows for all three levels -- picking one navigates to the
  // existing /exercises/list screen, filtered by that part (and level).
  const [levelFlowVisible, setLevelFlowVisible] = useState(false);
  const [levelFlowStep, setLevelFlowStep] = useState<'level' | 'bodyparts'>('level');
  const [levelFlowLevelId, setLevelFlowLevelId] = useState<string | null>(null);

  // ✅ tracks which level card was last tapped on the home "Workout
  // Levels" section so it can stay highlighted in blue (isActive border),
  // instead of expanding an inline exercise list like before.
  const [selectedHomeLevelId, setSelectedHomeLevelId] = useState<string | null>(null);

  // ✅ Smooth fade whenever the selected date (and therefore the schedule
  // card content) changes, instead of it snapping instantly.
  const scheduleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    scheduleAnim.setValue(0);
    Animated.timing(scheduleAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [selectedDateKey]);

  // Initial load — all reference data + this user's saved schedule
  // ✅ i18n.language dependency add ki taake language switch karne pe
  // bodyParts/equipment/workoutTypes/workoutLevels/workoutOptions dobara
  // fetch+translate ho jayen (pehle yeh sab English hi reh jate the).
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const [bp, eq, wt, wl, wo, scheduleResult] = await Promise.all([
        fetchBodyParts(),
        fetchEquipment(),
        fetchWorkoutTypes(),
        fetchWorkoutLevels(),
        fetchWorkoutOptions(),
        fetchUserSchedule(),
      ]);
      if (!isMounted) return;

      const [translatedBP, translatedEq, translatedWT, translatedWL, translatedWO] = await Promise.all([
        translateList(bp, ['label'], i18n.language),
        translateList(eq, ['label'], i18n.language),
        translateList(wt, ['label', 'meta'], i18n.language),
        translateList(wl, ['label', 'meta'], i18n.language),
        translateList(wo, ['title', 'meta'], i18n.language),
      ]);

      if (!isMounted) return;
      setBodyParts(translatedBP);
      setEquipmentList(translatedEq);
      setWorkoutTypes(translatedWT);
      setWorkoutLevels(translatedWL);
      setWorkoutOptions(translatedWO);
      setDaySchedule(scheduleResult.schedule);
      setDayScheduleLevel(scheduleResult.levels);
      registerScheduleItems(translatedWO);
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  const selectedWorkout = useMemo(() => {
    const assignedId = daySchedule[selectedDateKey];
    if (!assignedId) return null;
    const fromOptions = workoutOptions.find((w) => w.id === assignedId);
    if (fromOptions) return fromOptions;
    const cached = allScheduleItems[assignedId];
    if (cached) return { id: assignedId, title: cached.title, meta: cached.meta };
    return null;
  }, [daySchedule, selectedDateKey, workoutOptions, allScheduleItems]);

  // ✅ banner below "Schedule" now matches whichever level was used to
  // schedule the selected day (beginner/intermediate/advance), instead of
  // always showing the beginner banner. Falls back to the default beginner
  // banner if nothing was scheduled through the level flow yet.
  const bannerLevelId = dayScheduleLevel[selectedDateKey];
  const bannerImageSource =
    getLevelImage(bannerLevelId) ?? require('../../assets/images/schedule/beginner-fitness-plan.png.png');

  const selectedDateLabel = useMemo(() => {
    const fromWeek = weekDates.find((wd) => dateKey(wd) === selectedDateKey);
    const d = fromWeek ?? new Date(selectedDateKey + 'T00:00:00');
    return `${formatShort(d, t)}, ${d.getFullYear()}`;
  }, [weekDates, selectedDateKey, t]);

  const [expandedWorkoutType, setExpandedWorkoutType] = useState<string | null>(null);

  const handleBodyPartPress = (partId: string) => {
    router.push(`/exercises/list?part=${partId}`);
  };

  const handleEquipmentPress = (equipmentId: string) => {
    router.push(`/exercises/list?equipment=${equipmentId}`);
  };

  const handleWorkoutPress = (workoutId: string) => {
    router.push(`/exercises/list?workout=${workoutId}`);
  };

  const handleWorkoutTypePress = async (typeId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedWorkoutType === typeId) {
      setExpandedWorkoutType(null);
      return;
    }
    setExpandedWorkoutType(typeId);
    const exercises = await fetchExercisesFor('type', typeId);
    const translatedExercises = await translateList(exercises, ['title', 'meta'], i18n.language);
    setTypeExercises(translatedExercises);
    registerScheduleItems(translatedExercises);
  };

  // Generic "assign this item to the selected day" — works for a workout
  // option, or an exercise picked from the Workout Types list, or the
  // ready-made routines section.
  // Optimistic update + save to Supabase, with rollback on failure.
  const assignItemToSelectedDay = async (itemId: string, itemTitle: string, levelId?: string) => {
    const previous = daySchedule[selectedDateKey];
    const previousLevel = dayScheduleLevel[selectedDateKey];

    setDaySchedule((prev) => ({ ...prev, [selectedDateKey]: itemId }));
    // ✅ If a level is passed in, remember it so the banner can match it.
    // If not (Workout Types, ready-made routines), clear any previously
    // tracked level for this date.
    setDayScheduleLevel((prev) => {
      const next = { ...prev };
      if (levelId) {
        next[selectedDateKey] = levelId;
      } else {
        delete next[selectedDateKey];
      }
      return next;
    });

    setSavingSchedule(true);
    const success = await setScheduleForDate(selectedDateKey, itemId, itemTitle, levelId ?? null);
    setSavingSchedule(false);

    if (!success) {
      setDaySchedule((prev) => ({ ...prev, [selectedDateKey]: previous }));
      setDayScheduleLevel((prev) => {
        const next = { ...prev };
        if (previousLevel) {
          next[selectedDateKey] = previousLevel;
        } else {
          delete next[selectedDateKey];
        }
        return next;
      });
    }
  };

  // Remove whatever is scheduled on the selected day — optimistic update +
  // delete from Supabase, with rollback on failure.
  const removeScheduledWorkout = async () => {
    const previous = daySchedule[selectedDateKey];
    if (!previous) return;
    const previousLevel = dayScheduleLevel[selectedDateKey];

    setDaySchedule((prev) => {
      const next = { ...prev };
      delete next[selectedDateKey];
      return next;
    });
    setDayScheduleLevel((prev) => {
      const next = { ...prev };
      delete next[selectedDateKey];
      return next;
    });

    setRemovingSchedule(true);
    const success = await removeScheduleForDate(selectedDateKey);
    setRemovingSchedule(false);

    if (!success) {
      setDaySchedule((prev) => ({ ...prev, [selectedDateKey]: previous }));
      if (previousLevel) {
        setDayScheduleLevel((prev) => ({ ...prev, [selectedDateKey]: previousLevel }));
      }
    }
  };

  // ✅ Calendar se koi date select karne pe "This Week" strip ko bhi usi
  // hafte pe le jata hai -- pehle strip hamesha current week pe atki rehti
  // thi chahe aap kitni bhi door ki date select kar lein.
  const handleCalendarSelectDate = (key: string) => {
    setSelectedDateKey(key);

    const picked = new Date(key + 'T00:00:00');
    const pickedMonday = getMonday(picked);
    const todayMonday = getMonday(today);
    const diffWeeks = Math.round(
      (pickedMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    setWeekOffset(diffWeeks);
  };

  // ✅ "Add a workout" opens the same level -> body-parts popup, always
  // starting at the level-pick step (Beginner/Intermediate/Advance only).
  const openWorkoutPicker = () => {
    setLevelFlowStep('level');
    setLevelFlowLevelId(null);
    setLevelFlowVisible(true);
  };

  // ✅ home screen's "Workout Levels" cards jump straight to the
  // body-parts step for whichever level was tapped, and highlight that
  // card in blue (selectedHomeLevelId) instead of expanding an inline list.
  const openBodyPartsForLevel = (levelId: string) => {
    setSelectedHomeLevelId(levelId);
    setLevelFlowLevelId(levelId);
    setLevelFlowStep('bodyparts');
    setLevelFlowVisible(true);
  };

  // Level chosen inside the popup (from the "Add a workout" entry point) --
  // move on to the body-parts step, same list for every level.
  const handleLevelFlowPick = (levelId: string) => {
    setSelectedHomeLevelId(levelId);
    setLevelFlowLevelId(levelId);
    setLevelFlowStep('bodyparts');
  };

  const handleLevelFlowBack = () => {
    setLevelFlowStep('level');
    setLevelFlowLevelId(null);
  };

  // Body part chosen -- close the popup and assign the level + body-part
  // combo directly to the selected day (no navigation to a list screen).
  // levelId is passed through so the schedule banner still matches the
  // level, exactly like before.
  const handleBodyPartPickForLevel = (partId: string) => {
    const level = workoutLevels.find((l) => l.id === levelFlowLevelId);
    const part = bodyParts.find((p) => p.id === partId);
    const itemId = `${levelFlowLevelId ?? 'level'}-${partId}`;
    const itemTitle = `${level?.label ?? t('workoutPicker.exercisesFallback')} - ${part?.label ?? partId}`;
    const itemMeta = part ? `${level?.meta ?? ''} • ${part.label}` : level?.meta ?? '';

    registerScheduleItems([{ id: itemId, title: itemTitle, meta: itemMeta }]);
    setLevelFlowVisible(false);
    assignItemToSelectedDay(itemId, itemTitle, levelFlowLevelId ?? undefined);
  };

  if (loading) {
    return (
      <View style={[{ flex: 1 }, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* ✅ Shows the user's saved profile photo if set (same context
                as Profile screen) -- falls back to the person icon if no
                photo has been set yet. */}
            <View style={[styles.avatar, { backgroundColor: theme.surface, overflow: 'hidden' }]}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={{ width: 42, height: 42, borderRadius: 21 }} />
              ) : (
                <Ionicons name="person" size={20} color={theme.text} />
              )}
            </View>
            <View>
              {/* ✅ Real first name from signup/profile instead of the
                  hardcoded "Jacob". Falls back to "there" if not set yet. */}
              <Text style={[styles.greeting, { color: theme.text }]}>
                {t('common.greeting', { name: displayFirstName })} 👋
              </Text>
              <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>{t('common.stayHealthy')}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.bellBtn, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('common.search') ?? undefined}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* This Week */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('common.thisWeek')}</Text>
          <View style={styles.weekNavRow}>
            <TouchableOpacity onPress={() => setWeekOffset((w) => w - 1)}>
              <Ionicons name="chevron-back" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>{weekRangeLabel}</Text>
            <TouchableOpacity onPress={() => setWeekOffset((w) => w + 1)}>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCalendarVisible(true)}
              style={[styles.calendarIconBtn, { backgroundColor: theme.surface }]}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.weekRow}>
          {weekDates.map((d, index) => {
            const key = dateKey(d);
            const isSelected = selectedDateKey === key;
            const isToday = dateKey(today) === key;
            const hasWorkout = !!daySchedule[key];
            return (
              <AnimatedPressable
                key={key}
                onPress={() => setSelectedDateKey(key)}
                style={[styles.dayPill, { backgroundColor: isSelected ? theme.primary : theme.surface }]}
              >
                {isToday && !isSelected && (
                  <View style={[styles.todayDot, { backgroundColor: theme.primary }]} />
                )}
                <Text style={[styles.dayLetter, { color: isSelected ? '#FFFFFF' : theme.textSecondary }]}>
                  {t(`days.${dayKeys[index]}`)}
                </Text>
                <Text style={[styles.dayNumber, { color: isSelected ? '#FFFFFF' : theme.text }]}>{d.getDate()}</Text>
                {hasWorkout && !isSelected && (
                  <View style={[styles.scheduleDot, { backgroundColor: theme.primary }]} />
                )}
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Schedule */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24, marginBottom: 12 }]}>
          <Text style={[styles.subHeading, { color: theme.text, marginBottom: 0 }]}>
            {t('common.scheduleFor', { date: selectedDateLabel })}
          </Text>
        </View>

        <Animated.View style={{ opacity: scheduleAnim }}>
          <TouchableOpacity style={styles.bannerCard}>
            <Image
              source={bannerImageSource}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {selectedWorkout ? (
            <AnimatedPressable
              style={[styles.scheduleCard, { backgroundColor: theme.surface }]}
              onPress={() => handleWorkoutPress(selectedWorkout.id)}
            >
              <View style={[styles.imagePlaceholder, { width: 56, height: 56 }]}>
                <Ionicons name="fitness-outline" size={26} color={theme.textSecondary} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleTitle, { color: theme.text }]}>{selectedWorkout.title}</Text>
                <Text style={[styles.scheduleMeta, { color: theme.textSecondary }]}>{selectedWorkout.meta}</Text>
              </View>
              <View style={styles.scheduleActionsRow}>
                <TouchableOpacity
                  style={[styles.changeBtn, { borderColor: theme.border }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    openWorkoutPicker();
                  }}
                >
                  <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.changeBtn, { borderColor: theme.border }]}
                  disabled={removingSchedule}
                  onPress={(e) => {
                    e.stopPropagation();
                    removeScheduledWorkout();
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </AnimatedPressable>
          ) : (
            <AnimatedPressable
              style={[styles.emptyScheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openWorkoutPicker()}
            >
              <View style={[styles.imagePlaceholder, { width: 44, height: 44 }]}>
                <Ionicons name="add" size={22} color={theme.primary} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleTitle, { color: theme.text }]}>{t('common.addWorkout')}</Text>
                <Text style={[styles.scheduleMeta, { color: theme.textSecondary }]}>
                  {t('common.noWorkoutScheduled', { date: selectedDateLabel })}
                </Text>
              </View>
            </AnimatedPressable>
          )}
        </Animated.View>

        {/* Body parts */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.subHeading, { color: theme.text, marginBottom: 0 }]}>
            {t('common.bodyPartsExercise')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/exercises/body-part')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {bodyParts.map((part) => (
            <AnimatedPressable key={part.id} onPress={() => handleBodyPartPress(part.id)} style={styles.bodyPartItem}>
              <Image source={bodyPartImages[part.id]} style={styles.bodyPartCircle} resizeMode="cover" />
              <Text style={[styles.bodyPartLabel, { color: theme.textSecondary }]}>{part.label}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* Equipment */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.subHeading, { color: theme.text, marginBottom: 0 }]}>
            {t('common.equipmentBasedExercise')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/exercises/equipment')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {equipmentList.map((eq) => (
            <AnimatedPressable key={eq.id} style={styles.equipmentCard} onPress={() => handleEquipmentPress(eq.id)}>
              <View style={styles.equipmentImageWrap}>
                <Image source={equipmentImages[eq.id]} style={styles.equipmentImage} resizeMode="cover" />
              </View>
              <Text style={[styles.equipmentLabel, { color: theme.text }]} numberOfLines={1}>
                {eq.label}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* Workout Types */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>{t('common.workoutTypes')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutTypes.map((type) => {
            const isActive = expandedWorkoutType === type.id;
            return (
              <AnimatedPressable
                key={type.id}
                onPress={() => handleWorkoutTypePress(type.id)}
                style={[
                  styles.bigCard,
                  { borderColor: isActive ? theme.primary : 'transparent', borderWidth: isActive ? 2 : 0 },
                ]}
              >
                <Image source={workoutTypeImages[type.id]} style={styles.bigCardImage} resizeMode="cover" />
                {type.is_pro && (
                  <View style={[styles.proBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.proBadgeText}>{t('common.pro')}</Text>
                  </View>
                )}
                <View style={styles.bigCardOverlay}>
                  <Text style={styles.bigCardTitle} numberOfLines={2}>
                    {type.label}
                  </Text>
                  <Text style={styles.bigCardMeta} numberOfLines={1}>
                    {type.meta}
                  </Text>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        {expandedWorkoutType && (
          <View style={[styles.expandedList, { backgroundColor: theme.surface }]}>
            {typeExercises.length === 0 ? (
              // ✅ Agar is workout type ke liye koi exercise na mile (empty
              // result), to blank jagah dikhne ke bajaye proper message
              // dikhaya jaye -- user ko lage ki kuch load nahi hua, filter
              // change karne ki request nahi.
              <View style={styles.emptyExercisesWrap}>
                <Ionicons name="alert-circle-outline" size={22} color={theme.textSecondary} />
                <Text style={[styles.emptyExercisesText, { color: theme.textSecondary }]}>
                  {t('common.noExercisesFound')}
                </Text>
              </View>
            ) : (
              typeExercises.map((ex) => (
                <View key={ex.id} style={styles.expandedRow}>
                  <TouchableOpacity
                    style={styles.expandedRowMain}
                    onPress={() => handleWorkoutPress(ex.id)}
                  >
                    <View style={[styles.imagePlaceholder, { width: 44, height: 44 }]}>
                      <Ionicons name="barbell-outline" size={20} color={theme.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exTitle, { color: theme.text }]}>{ex.title}</Text>
                      <Text style={[styles.exMeta, { color: theme.textSecondary }]}>{ex.meta}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.scheduleAddBtn, { borderColor: theme.border }]}
                    disabled={savingSchedule}
                    onPress={() => assignItemToSelectedDay(ex.id, ex.title)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Workout Levels — tapping a card highlights it in blue and opens
            the body-parts popup for that level (same popup used by
            "Add a workout"), instead of expanding an inline exercise list. */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>{t('common.workoutLevels')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutLevels.map((level) => {
            const isActive = selectedHomeLevelId === level.id;
            return (
              <AnimatedPressable
                key={level.id}
                onPress={() => openBodyPartsForLevel(level.id)}
                style={[
                  styles.bigCard,
                  { borderColor: isActive ? theme.primary : 'transparent', borderWidth: isActive ? 2 : 0 },
                ]}
              >
                <Image source={getLevelImage(level.id)} style={styles.bigCardImage} resizeMode="cover" />
                <View style={styles.bigCardOverlay}>
                  <Text style={styles.bigCardTitle} numberOfLines={2}>
                    {level.label}
                  </Text>
                  <Text style={styles.bigCardMeta} numberOfLines={1}>
                    {level.meta}
                  </Text>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        {/* Level -> body-parts popup — ab standalone component se aata hai
            (components/LevelWorkoutPickerModal.tsx), shared by "Add a
            workout" (starts at the level step) and the home "Workout
            Levels" cards (jump straight to the body-parts step). */}
        <LevelWorkoutPickerModal
          visible={levelFlowVisible}
          onClose={() => setLevelFlowVisible(false)}
          step={levelFlowStep}
          onBack={handleLevelFlowBack}
          workoutLevels={workoutLevels}
          onPickLevel={handleLevelFlowPick}
          getLevelImage={getLevelImage}
          selectedLevelId={levelFlowLevelId}
          bodyParts={bodyParts}
          onPickBodyPart={handleBodyPartPickForLevel}
        />

        <CalendarPickerModal
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          selectedDateKey={selectedDateKey}
          onSelectDate={handleCalendarSelectDate}
          scheduledDateKeys={Object.keys(daySchedule)}
        />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fitbotFab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/fitbot')}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { fontSize: 18, fontWeight: '700' },
  greetingSub: { fontSize: 13, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  bellBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 24,
  },
  searchInput: { flex: 1, fontSize: 14 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionLink: { fontSize: 13, fontWeight: '600' },
  weekNavRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontSize: 12, fontWeight: '500' },
  calendarIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  subHeading: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  horizontalScroll: { marginBottom: 4 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayPill: {
    width: 38,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dayLetter: { fontSize: 11 },
  dayNumber: { fontSize: 14, fontWeight: '700' },
  todayDot: { position: 'absolute', top: 4, width: 6, height: 6, borderRadius: 3 },
  scheduleDot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 2.5 },

  imagePlaceholder: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bannerCard: { width: '100%', height: 130, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  bannerImage: { width: '100%', height: '100%' },

  scheduleCard: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyScheduleCard: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  scheduleInfo: { flex: 1 },
  scheduleTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  scheduleMeta: { fontSize: 12 },
  scheduleActionsRow: { flexDirection: 'row', gap: 8 },
  changeBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  bodyPartItem: { alignItems: 'center', marginRight: 16 },
  bodyPartCircle: { width: 64, height: 64, borderRadius: 32, marginBottom: 6 },
  bodyPartLabel: { fontSize: 12 },

  equipmentCard: { width: 130, marginRight: 12 },
  equipmentImageWrap: { width: '100%', height: 150, borderRadius: 16, overflow: 'hidden' },
  equipmentImage: { width: '100%', height: '100%' },
  equipmentLabel: { fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'center' },

  bigCard: {
    width: 220,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  bigCardImage: { width: '100%', height: '100%', position: 'absolute' },
  bigCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bigCardTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  bigCardMeta: { color: '#E0E0E0', fontSize: 11, marginTop: 2 },
  proBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  expandedList: { borderRadius: 14, padding: 8, marginTop: 8 },
  emptyExercisesWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  emptyExercisesText: { fontSize: 13, textAlign: 'center' },
  expandedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  expandedRowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  scheduleAddBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  exTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  exMeta: { fontSize: 11 },

  // ✅ standalone "Ready-made Routines" cards (no image, separate section)
  routineCard: {
    width: 150,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
  },

  fitbotFab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
