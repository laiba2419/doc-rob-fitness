import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/BottomNav';
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
// NOTE: ids here are the canonical body-part ids used across the whole app
// (Home, /exercises/body-part, and /exercises/list filters). Keep them in
// sync if you add/rename a body part anywhere.
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

// ---------- Equipment (real photos, label rendered below each image) ----------
// NOTE: ids here are canonical across Home, /exercises/equipment, and the
// equipment filter in /exercises/list.
const equipmentExercises = [
  {
    id: 'dumbbell',
    label: 'Dumbbells',
    image: require('../../assets/images/equipment/Dumbbells.png'),
  },
  {
    id: 'jumprope',
    label: 'Jump Rope',
    image: require('../../assets/images/equipment/Jumprope.png'),
  },
  {
    id: 'kettlebell',
    label: 'Kettlebells',
    image: require('../../assets/images/equipment/kettlebells.png'),
  },
  {
    id: 'bench',
    label: 'Bench',
    image: require('../../assets/images/equipment/bench.png'),
  },
  {
    id: 'barbell',
    label: 'Barbell',
    image: require('../../assets/images/equipment/Barbell.png'),
  },
  {
    id: 'gymball',
    label: 'Exercise Ball',
    image: require('../../assets/images/equipment/exercise ball.png'),
  },
  {
    id: 'weightplate',
    label: 'Weight Plate',
    image: require('../../assets/images/equipment/weight plate.png'),
  },
];

// ---------- Workout Types: 7 photos. Export from Figma and save them in
// assets/images/workout-types/ as "type-1.png" through "type-7.png" ----------
const workoutTypes = [
  { id: 'type-1', label: 'Strength', image: require('../../assets/images/workout-types/type-1.png') },
  { id: 'type-2', label: 'Cardio', image: require('../../assets/images/workout-types/type-2.png') },
  { id: 'type-3', label: 'Yoga', image: require('../../assets/images/workout-types/type-3.png') },
  { id: 'type-4', label: 'HIIT', image: require('../../assets/images/workout-types/type-4.png') },
  { id: 'type-5', label: 'Stretching', image: require('../../assets/images/workout-types/type-5.png') },
  { id: 'type-6', label: 'Crossfit', image: require('../../assets/images/workout-types/type-6.png') },
  { id: 'type-7', label: 'Pilates', image: require('../../assets/images/workout-types/type-7.png') },
];

// Demo data: selecting a workout type below shows these exercises
const workoutTypeExercises: Record<string, { id: string; title: string; meta: string }[]> = {
  'type-1': [
    { id: 's1', title: 'Deadlift', meta: '4 Sets | 8 Reps' },
    { id: 's2', title: 'Bench Press', meta: '4 Sets | 10 Reps' },
  ],
  'type-2': [
    { id: 'c1', title: 'Jump Rope Sprint', meta: '5 Rounds | 1 Min' },
    { id: 'c2', title: 'Treadmill Run', meta: '20 Mins' },
  ],
  'type-3': [{ id: 'y1', title: 'Sun Salutation Flow', meta: '15 Mins' }],
  'type-4': [{ id: 'h1', title: 'Burpee Circuit', meta: '4 Rounds | 30 Sec' }],
  'type-5': [{ id: 'st1', title: 'Hamstring Stretch', meta: '3 Sets | 30 Sec' }],
  'type-6': [{ id: 'cf1', title: 'WOD: Push-Pull-Squat', meta: '20 Mins' }],
  'type-7': [{ id: 'p1', title: 'Pilates Core Flow', meta: '18 Mins' }],
};

// ---------- Workout Levels: 3 photos. Export from Figma and save them in
// assets/images/levels/ as "beginner.png", "intermediate.png",
// "advance.png" ----------
const workoutLevels = [
  { id: 'beginner', label: 'Beginner', image: require('../../assets/images/levels/beginner.png') },
  { id: 'intermediate', label: 'Intermediate', image: require('../../assets/images/levels/intermediate.png') },
  { id: 'advance', label: 'Advance', image: require('../../assets/images/levels/advance.png') },
];

// ---------- Schedule: the user can pick their own workout ----------
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

  const [selectedWorkout, setSelectedWorkout] = useState(workoutOptions[1]);
  const [workoutPickerVisible, setWorkoutPickerVisible] = useState(false);

  const [expandedWorkoutType, setExpandedWorkoutType] = useState<string | null>(null);

  // Body part / Equipment -> general exercise list, filtered by that tag.
  const handleBodyPartPress = (partId: string) => {
    router.push(`/exercises/list?part=${partId}`);
  };

  const handleEquipmentPress = (equipmentId: string) => {
    router.push(`/exercises/list?equipment=${equipmentId}`);
  };

  // Schedule card -> exercise list filtered by that specific planned workout.
  const handleWorkoutPress = (workoutId: string) => {
    router.push(`/exercises/list?workout=${workoutId}`);
  };

  // Workout Levels -> exercise list filtered by difficulty. No dedicated
  // full page here since there are only 3 fixed cards (unlike Body Part /
  // Equipment, a "See All" grid isn't needed) -- going straight to the
  // filtered list is the simplest option.
  const handleLevelPress = (levelId: string) => {
    router.push(`/exercises/list?level=${levelId}`);
  };

  const handleWorkoutTypePress = (typeId: string) => {
    setExpandedWorkoutType((prev) => (prev === typeId ? null : typeId));
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
            {/* Note: replace with the real profile photo, currently a placeholder icon */}
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

        {/* This Week - live calendar, current actual date/year */}
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
          </View>
        </View>

        <View style={styles.weekRow}>
          {weekDates.map((d, index) => {
            const key = dateKey(d);
            const isSelected = selectedDateKey === key;
            const isToday = dateKey(today) === key;
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
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>Schedule</Text>

        <TouchableOpacity style={styles.bannerCard}>
          <Image
  source={require('../../assets/images/schedule/beginner-fitness-plan.png.png')}
  style={styles.bannerImage}
  resizeMode="cover"
/>
        </TouchableOpacity>

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

        {/* Body parts - full scrollable list with real photos */}
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

        {/* Equipment - full scrollable list with real photos (label baked into image) */}
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

        {/* Workout Types - 7 slots, tapping expands a list right here on Home */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>Workout Types</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {workoutTypes.map((type) => {
            const isActive = expandedWorkoutType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleWorkoutTypePress(type.id)}
                style={styles.workoutTypeItem}
              >
                <Image
                  source={type.image}
                  style={[
                    styles.workoutTypeCircle,
                    { borderWidth: isActive ? 2 : 0, borderColor: theme.primary },
                  ]}
                  resizeMode="cover"
                />
                <Text style={[styles.bodyPartLabel, { color: theme.textSecondary }]}>{type.label}</Text>
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

        {/* Workout Levels - real photos */}
        <Text style={[styles.subHeading, { color: theme.text, marginTop: 24 }]}>Workout Levels</Text>
        <View style={styles.levelsRow}>
          {workoutLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={styles.levelCard}
              onPress={() => handleLevelPress(level.id)}
            >
              <Image source={level.image} style={styles.levelImage} resizeMode="cover" />
              <View style={styles.levelOverlay}>
                <Text style={styles.levelCardText}>{level.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout picker modal - opens from the "pencil" icon on the Schedule card */}
        <Modal visible={workoutPickerVisible} transparent animationType="slide" onRequestClose={() => setWorkoutPickerVisible(false)}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setWorkoutPickerVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Select today's workout</Text>
            {workoutOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.sheetRow}
                onPress={() => {
                  setSelectedWorkout(opt);
                  setWorkoutPickerVisible(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exTitle, { color: theme.text }]}>{opt.title}</Text>
                  <Text style={[styles.exMeta, { color: theme.textSecondary }]}>{opt.meta}</Text>
                </View>
                {selectedWorkout.id === opt.id && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      </ScrollView>

      {/* Floating FitBot button - raised so it sits above BottomNav instead of overlapping it */}
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
  subHeading: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  horizontalScroll: { marginBottom: 4 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayPill: { width: 38, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 4 },
  dayLetter: { fontSize: 11 },
  dayNumber: { fontSize: 14, fontWeight: '700' },
  todayDot: { position: 'absolute', top: 4, width: 6, height: 6, borderRadius: 3 },

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

  workoutTypeItem: { alignItems: 'center', marginRight: 16 },
  workoutTypeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  expandedList: { borderRadius: 14, padding: 8, marginTop: 8 },
  expandedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 },
  exTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  exMeta: { fontSize: 11 },

  levelsRow: { flexDirection: 'row', gap: 12 },
  levelCard: { flex: 1, height: 90, borderRadius: 16, overflow: 'hidden' },
  levelImage: { width: '100%', height: '100%' },
  levelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  levelCardText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

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
