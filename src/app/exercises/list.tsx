import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Exercise = {
  id: string;
  title: string;
  meta: string;
  description: string;
  bodyPart: string;
  equipment: string;
  level: 'beginner' | 'intermediate' | 'advanced';
};

// NOTE: bodyPart / equipment values here must match the ids used on Home,
// /exercises/body-part, and /exercises/equipment -- that's what keeps the
// filters and the "tap a category" navigation in sync across the app.
const exercises: Exercise[] = [
  {
    id: '1',
    title: 'Hammer Curls',
    meta: '3 Sets | 12 Reps',
    description:
      'Hold a dumbbell in each hand with palms facing your body and curl both weights up together without rotating your wrists. Targets the biceps and forearms.',
    bodyPart: 'biceps',
    equipment: 'dumbbell',
    level: 'beginner',
  },
  {
    id: '2',
    title: 'Concentration Curls',
    meta: '3 Sets | 10 Reps',
    description:
      'Sit on a bench, rest your elbow against your inner thigh, and curl the dumbbell slowly toward your shoulder. Isolates the biceps for a deeper contraction.',
    bodyPart: 'biceps',
    equipment: 'dumbbell',
    level: 'beginner',
  },
  {
    id: '3',
    title: 'Incline Bicep Curls',
    meta: '3 Sets | 12 Reps',
    description:
      'Lie back on an incline bench and curl the dumbbells up, keeping your elbows behind your torso. Increases the stretch on the biceps for greater activation.',
    bodyPart: 'biceps',
    equipment: 'dumbbell',
    level: 'intermediate',
  },
  {
    id: '4',
    title: 'Reverse Curls',
    meta: '3 Sets | 10 Reps',
    description:
      'Grip the dumbbells with palms facing down and curl upward. Shifts the emphasis onto the forearms and brachialis.',
    bodyPart: 'biceps',
    equipment: 'dumbbell',
    level: 'intermediate',
  },
  {
    id: '5',
    title: 'Alternating Bicep Curls',
    meta: '3 Sets | 12 Reps',
    description:
      'Curl one dumbbell at a time while keeping the opposite arm extended, allowing a full range of motion for each arm individually.',
    bodyPart: 'biceps',
    equipment: 'dumbbell',
    level: 'advanced',
  },
  {
    id: '6',
    title: 'Wide Hands Push-Up',
    meta: '3 Sets | 15 Reps',
    description:
      'Place your hands wider than shoulder-width and lower your chest toward the floor, then press back up. Emphasizes the outer chest muscles.',
    bodyPart: 'chest',
    equipment: 'none',
    level: 'beginner',
  },
  {
    id: '7',
    title: 'Barbell Bench Press',
    meta: '4 Sets | 8 Reps',
    description:
      'Lower the barbell to your mid-chest and press it back up over your shoulders. A core compound move for chest, shoulders, and triceps.',
    bodyPart: 'chest',
    equipment: 'barbell',
    level: 'intermediate',
  },
  {
    id: '8',
    title: 'Bodyweight Squat',
    meta: '3 Sets | 15 Reps',
    description:
      'Stand with feet shoulder-width apart and lower your hips back and down as if sitting into a chair, then drive back up. Builds foundational leg strength.',
    bodyPart: 'leg',
    equipment: 'none',
    level: 'beginner',
  },
  {
    id: '9',
    title: 'Barbell Back Squat',
    meta: '4 Sets | 6 Reps',
    description:
      'Rest the barbell across your upper back and squat down until your thighs are parallel to the floor. A heavy compound lift for overall leg power.',
    bodyPart: 'leg',
    equipment: 'barbell',
    level: 'advanced',
  },
  {
    id: '10',
    title: 'Standing Dumbbell Shoulder Press',
    meta: '3 Sets | 10 Reps',
    description:
      'Press the dumbbells overhead from shoulder height until your arms are fully extended. Builds shoulder strength and stability.',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    level: 'intermediate',
  },
  {
    id: '11',
    title: 'Plank',
    meta: '3 Sets | 30 Sec',
    description:
      'Hold your body in a straight line from head to heels, supported on your forearms and toes. Strengthens the entire core.',
    bodyPart: 'abs',
    equipment: 'none',
    level: 'beginner',
  },
  {
    id: '12',
    title: 'Kettlebell Russian Twist',
    meta: '3 Sets | 16 Reps',
    description:
      'Sit with knees bent and lean back slightly, rotating a kettlebell from side to side. Targets the obliques and rotational core strength.',
    bodyPart: 'abs',
    equipment: 'kettlebell',
    level: 'intermediate',
  },
  {
    id: '13',
    title: 'Superman Back Extension',
    meta: '3 Sets | 12 Reps',
    description:
      'Lie face down and simultaneously lift your arms, chest, and legs off the floor. Strengthens the lower back and improves posture.',
    bodyPart: 'back',
    equipment: 'none',
    level: 'beginner',
  },
  {
    id: '14',
    title: 'Bench Tricep Dips',
    meta: '3 Sets | 12 Reps',
    description:
      'Support your body on a bench with hands behind you and lower your hips toward the floor, then push back up. Isolates the triceps.',
    bodyPart: 'triceps',
    equipment: 'bench',
    level: 'beginner',
  },
  {
    id: '15',
    title: 'Overhead Triceps Extension',
    meta: '3 Sets | 10 Reps',
    description:
      'Hold a dumbbell with both hands behind your head and extend your arms upward. Stretches and strengthens the triceps.',
    bodyPart: 'triceps',
    equipment: 'dumbbell',
    level: 'intermediate',
  },
  {
    id: '16',
    title: 'Goblet Squat',
    meta: '3 Sets | 12 Reps',
    description:
      'Hold a dumbbell close to your chest and squat down between your knees. Builds quad strength while keeping the torso upright.',
    bodyPart: 'quadriceps',
    equipment: 'dumbbell',
    level: 'intermediate',
  },
  {
    id: '17',
    title: 'Gym Ball Hamstring Curl',
    meta: '3 Sets | 15 Reps',
    description:
      'Lie on your back with heels on an exercise ball and curl it toward your hips by lifting your pelvis. Targets the hamstrings and glutes.',
    bodyPart: 'hamstrings',
    equipment: 'gymball',
    level: 'intermediate',
  },
  {
    id: '18',
    title: 'Jump Rope Cardio Burst',
    meta: '5 Rounds | 1 Min',
    description:
      'Jump continuously over the rope at a steady rhythm. A full-body cardio move that also improves coordination.',
    bodyPart: 'full-body',
    equipment: 'jumprope',
    level: 'beginner',
  },
  {
    id: '19',
    title: 'Weight Plate Front Raise',
    meta: '3 Sets | 12 Reps',
    description:
      'Hold a weight plate with both hands and raise it straight in front of you to shoulder height. Builds the front deltoids.',
    bodyPart: 'shoulders',
    equipment: 'weightplate',
    level: 'intermediate',
  },
  {
    id: '20',
    title: 'Push-Up to Plank',
    meta: '3 Sets | 12 Reps',
    description:
      'Perform a push-up, then hold briefly in the plank position before lowering again. Combines upper-body pushing strength with core stability.',
    bodyPart: 'upper-body',
    equipment: 'none',
    level: 'beginner',
  },
];

const bodyPartOptions = [
  { id: 'full-body', label: 'Full Body', icon: 'body-outline' },
  { id: 'leg', label: 'Leg', icon: 'walk-outline' },
  { id: 'shoulders', label: 'Shoulders', icon: 'body-outline' },
  { id: 'biceps', label: 'Biceps', icon: 'barbell-outline' },
  { id: 'abs', label: 'Abs', icon: 'body-outline' },
  { id: 'back', label: 'Back', icon: 'body-outline' },
  { id: 'triceps', label: 'Triceps', icon: 'barbell-outline' },
  { id: 'chest', label: 'Chest', icon: 'body-outline' },
  { id: 'quadriceps', label: 'Quadriceps', icon: 'walk-outline' },
  { id: 'hamstrings', label: 'Hamstrings', icon: 'walk-outline' },
  { id: 'upper-body', label: 'Upper Body', icon: 'body-outline' },
];

const equipmentOptions = [
  { id: 'dumbbell', label: 'Dumbbell', icon: 'barbell-outline' },
  { id: 'jumprope', label: 'Jump Rope', icon: 'infinite-outline' },
  { id: 'gymball', label: 'Exercise Ball', icon: 'ellipse-outline' },
  { id: 'kettlebell', label: 'Kettlebell', icon: 'fitness-outline' },
  { id: 'barbell', label: 'Barbell', icon: 'barbell-outline' },
  { id: 'bench', label: 'Bench', icon: 'square-outline' },
  { id: 'weightplate', label: 'Weight Plate', icon: 'ellipse-outline' },
];

const levelOptions = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

type FilterType = 'bodyPart' | 'equipment' | 'levels' | null;

export default function ExerciseListScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ part?: string; equipment?: string; level?: string }>();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(
    params.part ? [params.part] : []
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    params.equipment ? [params.equipment] : []
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    params.level ? [params.level] : []
  );

  const toggleValue = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const toggleExpanded = (id: string) => {
    setExpandedExerciseId((prev) => (prev === id ? null : id));
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.title.toLowerCase().includes(search.toLowerCase());
      const matchesBodyPart = selectedBodyParts.length === 0 || selectedBodyParts.includes(ex.bodyPart);
      const matchesEquipment = selectedEquipment.length === 0 || selectedEquipment.includes(ex.equipment);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(ex.level);
      return matchesSearch && matchesBodyPart && matchesEquipment && matchesLevel;
    });
  }, [search, selectedBodyParts, selectedEquipment, selectedLevels]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Search Exercise</Text>

      <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search Exercise"
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity onPress={() => setActiveFilter('levels')}>
          <Ionicons name="options-outline" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabChip,
            { backgroundColor: selectedBodyParts.length ? theme.primary : theme.surface },
          ]}
          onPress={() => setActiveFilter('bodyPart')}
        >
          <Text style={[styles.tabChipText, { color: selectedBodyParts.length ? '#FFFFFF' : theme.text }]}>
            Body Parts
          </Text>
          <Ionicons name="chevron-down" size={14} color={selectedBodyParts.length ? '#FFFFFF' : theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabChip,
            { backgroundColor: selectedEquipment.length ? theme.primary : theme.surface },
          ]}
          onPress={() => setActiveFilter('equipment')}
        >
          <Text style={[styles.tabChipText, { color: selectedEquipment.length ? '#FFFFFF' : theme.text }]}>
            Equipment
          </Text>
          <Ionicons name="chevron-down" size={14} color={selectedEquipment.length ? '#FFFFFF' : theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {filteredExercises.map((ex) => {
          const isExpanded = expandedExerciseId === ex.id;
          return (
            <TouchableOpacity
              key={ex.id}
              style={[styles.exerciseCard, { backgroundColor: theme.surface }]}
              onPress={() => toggleExpanded(ex.id)}
              activeOpacity={0.85}
            >
              <View style={styles.exerciseRow}>
                {/* Note: swap this icon for a real exercise photo once available */}
                <View style={[styles.thumb, { backgroundColor: theme.background }]}>
                  <Ionicons name="body-outline" size={24} color={theme.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exerciseTitle, { color: theme.text }]}>{ex.title}</Text>
                  <Text style={[styles.exerciseMeta, { color: theme.textSecondary }]}>{ex.meta}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                  size={18}
                  color={theme.textSecondary}
                />
              </View>
              {isExpanded && (
                <Text style={[styles.exerciseDescription, { color: theme.textSecondary }]}>
                  {ex.description}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredExercises.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No exercises found. Try adjusting your filters.
          </Text>
        )}
      </ScrollView>

      {/* Body Part filter sheet */}
      <FilterSheet
        visible={activeFilter === 'bodyPart'}
        onClose={() => setActiveFilter(null)}
        title="Filter Body Part"
        secondaryLabel={selectedBodyParts.length === bodyPartOptions.length ? 'Deselect all' : 'Select all'}
        onSecondaryPress={() =>
          setSelectedBodyParts(
            selectedBodyParts.length === bodyPartOptions.length ? [] : bodyPartOptions.map((o) => o.id)
          )
        }
        onShowResults={() => setActiveFilter(null)}
      >
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          <View style={styles.circleGrid}>
            {bodyPartOptions.map((opt) => {
              const isSelected = selectedBodyParts.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.circleItem}
                  onPress={() => toggleValue(selectedBodyParts, setSelectedBodyParts, opt.id)}
                >
                  <View
                    style={[
                      styles.circleIcon,
                      {
                        backgroundColor: theme.background,
                        borderColor: isSelected ? theme.primary : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons name={opt.icon as any} size={22} color={theme.text} />
                  </View>
                  <Text style={[styles.circleLabel, { color: theme.textSecondary }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </FilterSheet>

      {/* Equipment filter sheet */}
      <FilterSheet
        visible={activeFilter === 'equipment'}
        onClose={() => setActiveFilter(null)}
        title="Filter Equipment"
        secondaryLabel={selectedEquipment.length === equipmentOptions.length ? 'Deselect all' : 'Select all'}
        onSecondaryPress={() =>
          setSelectedEquipment(
            selectedEquipment.length === equipmentOptions.length ? [] : equipmentOptions.map((o) => o.id)
          )
        }
        onShowResults={() => setActiveFilter(null)}
      >
        <View style={styles.cardGrid}>
          {equipmentOptions.map((opt) => {
            const isSelected = selectedEquipment.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.equipmentCardItem,
                  {
                    backgroundColor: theme.background,
                    borderColor: isSelected ? theme.primary : 'transparent',
                  },
                ]}
                onPress={() => toggleValue(selectedEquipment, setSelectedEquipment, opt.id)}
              >
                <Ionicons name={opt.icon as any} size={26} color={theme.text} />
                <Text style={[styles.equipmentCardLabel, { color: theme.textSecondary }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </FilterSheet>

      {/* Levels filter sheet */}
      <FilterSheet
        visible={activeFilter === 'levels'}
        onClose={() => setActiveFilter(null)}
        title="Filter Levels"
        secondaryLabel="Clear all"
        onSecondaryPress={() => setSelectedLevels([])}
        onShowResults={() => setActiveFilter(null)}
      >
        <View>
          {levelOptions.map((opt) => {
            const isSelected = selectedLevels.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={styles.checkRow}
                onPress={() => toggleValue(selectedLevels, setSelectedLevels, opt.id)}
              >
                <Text style={[styles.checkLabel, { color: theme.text }]}>{opt.label}</Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </FilterSheet>
    </View>
  );
}

function FilterSheet({
  visible,
  onClose,
  title,
  secondaryLabel,
  onSecondaryPress,
  onShowResults,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  secondaryLabel: string;
  onSecondaryPress: () => void;
  onShowResults: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <View style={styles.sheetHeaderRow}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text>
          <TouchableOpacity onPress={onSecondaryPress}>
            <Text style={[styles.sheetSecondaryLink, { color: theme.primary }]}>{secondaryLabel}</Text>
          </TouchableOpacity>
        </View>

        {children}

        <TouchableOpacity style={[styles.showResultsBtn, { backgroundColor: theme.primary }]} onPress={onShowResults}>
          <Text style={styles.showResultsText}>Show results</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabChipText: { fontSize: 13, fontWeight: '600' },
  exerciseCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: { width: 48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  exerciseTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  exerciseMeta: { fontSize: 12 },
  exerciseDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 },
  sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetSecondaryLink: { fontSize: 13, fontWeight: '600' },

  circleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 8 },
  circleItem: { alignItems: 'center', width: '28%' },
  circleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  circleLabel: { fontSize: 12, textAlign: 'center' },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  equipmentCardItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  equipmentCardLabel: { fontSize: 11, textAlign: 'center' },

  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  checkLabel: { fontSize: 14, fontWeight: '500' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  showResultsBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  showResultsText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
