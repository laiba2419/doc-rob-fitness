import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import CalendarPickerModal from '@/components/CalendarPickerModal';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------- Body parts (real photos, exported from Figma) ----------
const bodyParts = [
  { id: 'leg', label: 'Leg', image: require('../../assets/images/body-parts/leg.png') },
  { id: 'shoulders', label: 'Shoulders', image: require('../../assets/images/body-parts/shoulders.png') },
  { id: 'biceps', label: 'Biceps', image: require('../../assets/images/body-parts/Biceps.png') },
  { id: 'abs', label: 'Abs', image: require('../../assets/images/body-parts/abs.png') },
  { id: 'back', label: 'Back', image: require('../../assets/images/body-parts/Backs.png') },
  { id: 'triceps', label: 'Triceps', image: require('../../assets/images/body-parts/Triceps.png') },
  { id: 'chest', label: 'Chest', image: require('../../assets/images/body-parts/Chest.png') },
  { id: 'quadriceps', label: 'Quadriceps', image: require('../../assets/images/body-parts/Quadriceps.png') },
  { id: 'hamstrings', label: 'Hamstrings', image: require('../../assets/images/body-parts/Hamstrings.png') },
  { id: 'upper-body', label: 'Upper Body', image: require('../../assets/images/body-parts/upper-body.png') },
];

// ---------- Equipment ----------
const equipmentExercises = [
  { id: 'dumbbell', label: 'Dumbbells', image: require('../../assets/images/equipment/Dumbbells.png') },
  { id: 'jumprope', label: 'Jump Rope', image: require('../../assets/images/equipment/Jumprope.png') },
  { id: 'kettlebell', label: 'Kettlebells', image: require('../../assets/images/equipment/kettlebells.png') },
  { id: 'bench', label: 'Bench', image: require('../../assets/images/equipment/bench.png') },
  { id: 'barbell', label: 'Barbell', image: require('../../assets/images/equipment/Barbell.png') },
  { id: 'gymball', label: 'Exercise Ball', image: require('../../assets/images/equipment/exercise ball.png') },
  { id: 'weightplate', label: 'Weight Plate', image: require('../../assets/images/equipment/weight plate.png') },
];

// ---------- Workout Types: 7 photos, with Pro badge + meta like Figma ----------
const workoutTypes = [
  {
    id: 'type-1',
    label: 'Total body & Cardio (gym)',
    meta: 'Home Workout | Beginner',
    pro: true,
    image: require('../../assets/images/workout-types/type-1.png'),
  },
  {
    id: 'type-2',
    label: 'Weight Gain Workouts',
    meta: 'Gym Workout | Advance',
    pro: true,
    image: require('../../assets/images/workout-types/type-2.png'),
  },
  {
    id: 'type-3',
    label: 'Abs Workout',
    meta: 'Gym Workout | Intermediate',
    pro: true,
    image: require('../../assets/images/workout-types/type-3.png'),
  },
  {
    id: 'type-4',
    label: 'Moderate Office Workout',
    meta: 'Gym Workout | Intermediate',
    pro: true,
    image: require('../../assets/images/workout-types/type-4.png'),
  },
  {
    id: 'type-5',
    label: 'Home - No Material',
    meta: 'Gym Workout | Intermediate',
    pro: true,
    image: require('../../assets/images/workout-types/type-5.png'),
  },
  {
    id: 'type-6',
    label: 'Total body | Free Weight',
    meta: 'Gym Workout | Intermediate',
    pro: true,
    image: require('../../assets/images/workout-types/type-6.png'),
  },
  {
    id: 'type-7',
    label: 'Back & Biceps Blitz',
    meta: 'Gym Workout | Intermediate',
    pro: true,
    image: require('../../assets/images/workout-types/type-7.png'),
  },
];

// Demo data: selecting a workout type below shows these exercises
const workoutTypeExercises: Record<string, { id: string; title: string; meta: string }[]> = {
  'type-1': [
    { id: 's1', title: 'Deadlift', meta: '4 Sets | 8 Reps' },
    { id: 's2', title: 'Bench Press', meta: '4 Sets | 10 Reps' },
  ],
  'type-2': [{ id: 'c1', title: 'Weighted Squats', meta: '4 Sets | 10 Reps' }],
  'type-3': [{ id: 'y1', title: 'Plank Hold', meta: '3 Sets | 45 Sec' }],
  'type-4': [{ id: 'h1', title: 'Desk Stretch Routine', meta: '15 Mins' }],
  'type-5': [{ id: 'st1', title: 'Bodyweight Circuit', meta: '4 Rounds | 30 Sec' }],
  'type-6': [{ id: 'cf1', title: 'Free Weight Full Body', meta: '20 Mins' }],
  'type-7': [{ id: 'p1', title: 'Back & Biceps Superset', meta: '4 Sets | 12 Reps' }],
};

// ---------- Workout Levels: same card pattern as Workout Types ----------
const workoutLevels = [
  {
    id: 'beginner',
    label: 'Beginner',
    meta: 'Gym Workout | Beginner',
    image: require('../../assets/images/levels/beginner.png'),
  },
  {
    id: 'advance-1',
    label: 'Advance',
    meta: 'Gym Workout | Advance',
    image: require('../../assets/images/levels/advance.png'),
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    meta: 'Gym Workout | Intermediate',
    image: require('../../assets/images/levels/intermediate.png'),
  },
  {
    id: 'advance-2',
    label: 'Advance',
    meta: 'Gym Workout | Advance',
    image: require('../../assets/images/levels/advance.png'),
  },
];

const workoutLevelExercises: Record<string, { id: string; title: string; meta: string }[]> = {
  beginner: [{ id: 'b1', title: 'Bodyweight Basics', meta: '3 Sets | 12 Reps' }],
  intermediate: [{ id: 'i1', title: 'Dumbbell Circuit', meta: '4 Sets | 10 Reps' }],
  'advance-1': [{ id: 'a1', title: 'Heavy Compound Lifts', meta: '5 Sets | 5 Reps' }],
  'advance-2': [{ id: 'a2', title: 'Advanced HIIT Burn', meta: '20 Mins' }],
};

// ---------- Schedule: workouts the user can pick per day ----------
const workoutOptions = [
  { id: 'leg-day', title: 'Leg Day', meta: '4 Sets | 35 Mins' },
  { id: 'upper-lower-chest', title: 'Upper, Lower Chest', meta: '4 Sets | 30 Mins' },
  { id: 'push-day', title: 'Push Day', meta: '4 Sets | 32 Mins' },
  { id: 'pull-day', title: 'Pull Day', meta: '4 Sets | 28 Mins' },
  { id: 'cardio-blast', title: 'Cardio Blast', meta: '20 Mins | 220 Cal' },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLetters = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatShort(d: Date) {
  return `${monthNames[d.getMonth()]} ${d.getDate()}`;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

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

  const weekRangeLabel = `${formatShort(weekDates[0])} - ${formatShort(weekDates[6])}, ${weekDates[0].getFullYear()}`;

  // Per-day schedule: { "2026-06-29": "leg-day", "2026-06-30": "push-day", ... }
  // User calendar se kisi bhi date pe tap kare (chahe is week mein ho ya
  // kisi doosre mahine mein), us din ke liye apna marzi ka workout assign
  // kar sakta hai — "28 June - Leg Day", "29 June - Push Day" wagera.
  const [daySchedule, setDaySchedule] = useState<Record<string, string>>({
    [dateKey(today)]: 'upper-lower-chest',
  });
  const [workoutPickerVisible, setWorkoutPickerVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Selected day ke liye workout resolve karo. Agar us din kuch assign
  // nahi hua to "Add a workout" wala empty state dikhao.
  const selectedWorkout = useMemo(() => {
    const assignedId = daySchedule[selectedDateKey];
    return workoutOptions.find((w) => w.id === assignedId) ?? null;
  }, [daySchedule, selectedDateKey]);

  // Selected date ko poori tarah dikhao (jaise "28 June, 2026") — agar yeh
  // current week-row mein nahi hai (calendar se kisi doosre mahine ka din
  // chuna gaya), to seedha selectedDateKey se parse karke label banao.
  const selectedDateLabel = useMemo(() => {
    const fromWeek = weekDates.find((wd) => dateKey(wd) === selectedDateKey);
    const d = fromWeek ?? new Date(selectedDateKey + 'T00:00:00');
    return `${formatShort(d)}, ${d.getFullYear()}`;
  }, [weekDates, selectedDateKey]);

  const [expandedWorkoutType, setExpandedWorkoutType] = useState<string | null>(null);
  const [expandedWorkoutLevel, setExpandedWorkoutLevel] = useState<string | null>(null);

  const handleBodyPartPress = (partId: string) => {
    router.push(`/exercises/list?part=${partId}`);
  };

  const handleEquipmentPress = (equipmentId: string) => {
    router.push(`/exercises/list?equipment=${equipmentId}`);
  };

  const handleWorkoutPress = (workoutId: string) => {
    router.push(`/exercises/list?workout=${workoutId}`);
  };

  const handleWorkoutTypePress = (typeId: string) => {
    setExpandedWorkoutType((prev) => (prev === typeId ? null : typeId));
  };

  const handleWorkoutLevelPress = (levelId: string) => {
    setExpandedWorkoutLevel((prev) => (prev === levelId ? null : levelId));
  };

  // Modal se workout pick hone par sirf selected day ke liye assign hota hai
  const assignWorkoutToSelectedDay = (workoutId: string) => {
    setDaySchedule((prev) => ({ ...prev, [selectedDateKey]: workoutId }));
    setWorkoutPickerVisible(false);
  };

  // Calendar popup se date chuni jaye to woh selected ban jati hai aur
  // popup band ho jata hai — agar woh date current week-row se bahar hai
  // (kisi doosre mahine ki), week-row apni jagah waisa hi rehta hai, sirf
  // Schedule section neeche us nayi date ka data dikhata hai.
  const handleCalendarSelectDate = (key: string) => {
    setSelectedDateKey(key);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: DP left, greeting, notification bell right */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
              <Ionicons name="person" size={20} color={theme.text} />
            </View>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>Hey, Jacob 👋</Text>
              <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>Stay Healthy always.</Text>
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
            placeholder="Search workouts"
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* This Week — bilkul wahi UI, bas ek calendar icon add hua jo
            month-view popup kholta hai */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
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
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedDateKey(key)}
                style={[styles.dayPill, { backgroundColor: isSelected ? theme.primary : theme.surface }]}
              >
                {isToday && !isSelected && (
                  <View style={[styles.todayDot, { backgroundColor: theme.primary }]} />
                )}
                <Text style={[styles.dayLetter, { color: isSelected ? '#FFFFFF' : theme.textSecondary }]}>
                  {dayLetters[index]}
                </Text>
                <Text style={[styles.dayNumber, { color: isSelected ? '#FFFFFF' : theme.text }]}>{d.getDate()}</Text>
                {/* Chote dot se pata chalta hai kis din workout schedule hai */}
                {hasWorkout && !isSelected && (
                  <View style={[styles.scheduleDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule — selected din (chahe week-row se ho ya calendar popup
            se kisi doosre mahine se) ke hisab se workout dikhata hai */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24, marginBottom: 12 }]}>
          <Text style={[styles.subHeading, { color: theme.text, marginBottom: 0 }]}>
            Schedule · {selectedDateLabel}
          </Text>
        </View>

        <TouchableOpacity style={styles.bannerCard}>
          <Image
            source={require('../../assets/images/schedule/beginner-fitness-plan.png.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {selectedWorkout ? (
          <TouchableOpacity
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
            <TouchableOpacity
              style={[styles.changeBtn, { borderColor: theme.border }]}
              onPress={(e) => {
                e.stopPropagation();
                setWorkoutPickerVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          // Empty state — is din ke liye abhi koi workout assign nahi hua
          <TouchableOpacity
            style={[styles.emptyScheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setWorkoutPickerVisible(true)}
          >
            <View style={[styles.imagePlaceholder, { width: 44, height: 44 }]}>
              <Ionicons name="add" size={22} color={theme.primary} />
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={[styles.scheduleTitle, { color: theme.text }]}>Add a workout</Text>
              <Text style={[styles.scheduleMeta, { color: theme.textSecondary }]}>
                No workout scheduled for {selectedDateLabel}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Body parts */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.subHeading, { color: theme.text, marginBottom: 0 }]}>Body parts Exercise</Text>
          <TouchableOpacity onPress={() => router.push('/exercises/body-part')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {bodyParts.map((part) => (
            <TouchableOpacity key={part.id} onPress={() => handleBodyPartPress(part.id)} style={styles.bodyPartItem}>
              <Image source={part.image} style={styles.bodyPartCircle} resizeMode="cover" />
              <Text style={[styles.bodyPartLabel, { color: theme.textSecondary }]}>{part.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Equipment */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.subHeading, { color: theme.text, marginBottom: 0 }]}>Equipment-Based Exercise</Text>
          <TouchableOpacity onPress={() => router.push('/exercises/equipment')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {equipmentExercises.map((eq) => (
            <TouchableOpacity key={eq.id} style={styles.equipmentCard} onPress={() => handleEquipmentPress(eq.id)}>
              <View style={styles.equipmentImageWrap}>
                <Image source={eq.image} style={styles.equipmentImage} resizeMode="cover" />
              </View>
              <Text style={[styles.equipmentLabel, { color: theme.text }]} numberOfLines={1}>
                {eq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Workout Types — bade cards, horizontal scroll, Pro badge + meta,
            click pe yahin home page par expand hota hai */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>Workout Types</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutTypes.map((type) => {
            const isActive = expandedWorkoutType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleWorkoutTypePress(type.id)}
                style={[
                  styles.bigCard,
                  { borderColor: isActive ? theme.primary : 'transparent', borderWidth: isActive ? 2 : 0 },
                ]}
              >
                <Image source={type.image} style={styles.bigCardImage} resizeMode="cover" />
                {type.pro && (
                  <View style={[styles.proBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.proBadgeText}>PRO</Text>
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
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {expandedWorkoutType && (
          <View style={[styles.expandedList, { backgroundColor: theme.surface }]}>
            {(workoutTypeExercises[expandedWorkoutType] || []).map((ex) => (
              <TouchableOpacity key={ex.id} style={styles.expandedRow} onPress={() => handleWorkoutPress(ex.id)}>
                <View style={[styles.imagePlaceholder, { width: 44, height: 44 }]}>
                  <Ionicons name="barbell-outline" size={20} color={theme.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exTitle, { color: theme.text }]}>{ex.title}</Text>
                  <Text style={[styles.exMeta, { color: theme.textSecondary }]}>{ex.meta}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Workout Levels — same bade-card pattern, horizontal scroll,
            click pe yahin home page par expand hota hai */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>Workout Levels</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutLevels.map((level) => {
            const isActive = expandedWorkoutLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                onPress={() => handleWorkoutLevelPress(level.id)}
                style={[
                  styles.bigCard,
                  { borderColor: isActive ? theme.primary : 'transparent', borderWidth: isActive ? 2 : 0 },
                ]}
              >
                <Image source={level.image} style={styles.bigCardImage} resizeMode="cover" />
                <View style={styles.bigCardOverlay}>
                  <Text style={styles.bigCardTitle} numberOfLines={2}>
                    {level.label}
                  </Text>
                  <Text style={styles.bigCardMeta} numberOfLines={1}>
                    {level.meta}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {expandedWorkoutLevel && (
          <View style={[styles.expandedList, { backgroundColor: theme.surface }]}>
            {(workoutLevelExercises[expandedWorkoutLevel] || []).map((ex) => (
              <TouchableOpacity key={ex.id} style={styles.expandedRow} onPress={() => handleWorkoutPress(ex.id)}>
                <View style={[styles.imagePlaceholder, { width: 44, height: 44 }]}>
                  <Ionicons name="barbell-outline" size={20} color={theme.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exTitle, { color: theme.text }]}>{ex.title}</Text>
                  <Text style={[styles.exMeta, { color: theme.textSecondary }]}>{ex.meta}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Workout picker modal — sirf selectedDateKey ke liye assign karta hai */}
        <Modal
          visible={workoutPickerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setWorkoutPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setWorkoutPickerVisible(false)}
          />
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              Select workout for {selectedDateLabel}
            </Text>
            {workoutOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.sheetRow}
                onPress={() => assignWorkoutToSelectedDay(opt.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exTitle, { color: theme.text }]}>{opt.title}</Text>
                  <Text style={[styles.exMeta, { color: theme.textSecondary }]}>{opt.meta}</Text>
                </View>
                {selectedWorkout?.id === opt.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>

        {/* Month calendar popup — "This Week" ke calendar icon se khulta hai.
            User kisi bhi mahine ki kisi bhi date pe tap kar sakta hai; us
            date ke liye phir Schedule section se workout assign hota hai. */}
        <CalendarPickerModal
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          selectedDateKey={selectedDateKey}
          onSelectDate={handleCalendarSelectDate}
          scheduledDateKeys={Object.keys(daySchedule)}
        />
      </ScrollView>

      {/* Floating FitBot button */}
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
  expandedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 },
  exTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  exMeta: { fontSize: 11 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

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
