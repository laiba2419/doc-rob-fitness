import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ExerciseMeta = {
  id: string;
  bodyPart: string;
  equipment: string;
  level: 'beginner' | 'intermediate' | 'advanced';
};

// NOTE: bodyPart / equipment values here must match the ids used on Home,
// /exercises/body-part, and /exercises/equipment -- that's what keeps the
// filters and the "tap a category" navigation in sync across the app.
// Title/meta/description now live in exercises.<id> in the translation
// files instead of being hardcoded here -- this array only keeps the
// filterable metadata.
const exercises: ExerciseMeta[] = [
  { id: '1', bodyPart: 'biceps', equipment: 'dumbbell', level: 'beginner' },
  { id: '2', bodyPart: 'biceps', equipment: 'dumbbell', level: 'beginner' },
  { id: '3', bodyPart: 'biceps', equipment: 'dumbbell', level: 'intermediate' },
  { id: '4', bodyPart: 'biceps', equipment: 'dumbbell', level: 'intermediate' },
  { id: '5', bodyPart: 'biceps', equipment: 'dumbbell', level: 'advanced' },
  { id: '6', bodyPart: 'chest', equipment: 'none', level: 'beginner' },
  { id: '7', bodyPart: 'chest', equipment: 'barbell', level: 'intermediate' },
  { id: '8', bodyPart: 'leg', equipment: 'none', level: 'beginner' },
  { id: '9', bodyPart: 'leg', equipment: 'barbell', level: 'advanced' },
  { id: '10', bodyPart: 'shoulders', equipment: 'dumbbell', level: 'intermediate' },
  { id: '11', bodyPart: 'abs', equipment: 'none', level: 'beginner' },
  { id: '12', bodyPart: 'abs', equipment: 'kettlebell', level: 'intermediate' },
  { id: '13', bodyPart: 'back', equipment: 'none', level: 'beginner' },
  { id: '14', bodyPart: 'triceps', equipment: 'bench', level: 'beginner' },
  { id: '15', bodyPart: 'triceps', equipment: 'dumbbell', level: 'intermediate' },
  { id: '16', bodyPart: 'quadriceps', equipment: 'dumbbell', level: 'intermediate' },
  { id: '17', bodyPart: 'hamstrings', equipment: 'gymball', level: 'intermediate' },
  { id: '18', bodyPart: 'full-body', equipment: 'jumprope', level: 'beginner' },
  { id: '19', bodyPart: 'shoulders', equipment: 'weightplate', level: 'intermediate' },
  { id: '20', bodyPart: 'upper-body', equipment: 'none', level: 'beginner' },
];

// bodyPartsList.json / equipmentList.json use camelCase keys -- these ids
// don't map 1:1 (e.g. "upper-body" -> "upperBody"), so translate through
// small lookup tables instead of using the raw id as the key.
const bodyPartOptions = [
  { id: 'full-body', labelKey: 'fullBody', icon: 'body-outline' },
  { id: 'leg', labelKey: 'leg', icon: 'walk-outline' },
  { id: 'shoulders', labelKey: 'shoulders', icon: 'body-outline' },
  { id: 'biceps', labelKey: 'biceps', icon: 'barbell-outline' },
  { id: 'abs', labelKey: 'abs', icon: 'body-outline' },
  { id: 'back', labelKey: 'back', icon: 'body-outline' },
  { id: 'triceps', labelKey: 'triceps', icon: 'barbell-outline' },
  { id: 'chest', labelKey: 'chest', icon: 'body-outline' },
  { id: 'quadriceps', labelKey: 'quadriceps', icon: 'walk-outline' },
  { id: 'hamstrings', labelKey: 'hamstrings', icon: 'walk-outline' },
  { id: 'upper-body', labelKey: 'upperBody', icon: 'body-outline' },
];

const equipmentOptions = [
  { id: 'dumbbell', icon: 'barbell-outline' },
  { id: 'jumprope', icon: 'infinite-outline' },
  { id: 'gymball', icon: 'ellipse-outline' },
  { id: 'kettlebell', icon: 'fitness-outline' },
  { id: 'barbell', icon: 'barbell-outline' },
  { id: 'bench', icon: 'square-outline' },
  { id: 'weightplate', icon: 'ellipse-outline' },
];

const levelOptions = [
  { id: 'beginner', labelKey: 'beginner' },
  { id: 'intermediate', labelKey: 'intermediate' },
  { id: 'advanced', labelKey: 'advanced' },
];

type FilterType = 'bodyPart' | 'equipment' | 'levels' | null;

export default function ExerciseListScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
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
      const title = t(`exercises.${ex.id}.title`);
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
      const matchesBodyPart = selectedBodyParts.length === 0 || selectedBodyParts.includes(ex.bodyPart);
      const matchesEquipment = selectedEquipment.length === 0 || selectedEquipment.includes(ex.equipment);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(ex.level);
      return matchesSearch && matchesBodyPart && matchesEquipment && matchesLevel;
    });
  }, [search, selectedBodyParts, selectedEquipment, selectedLevels, t]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('common.searchExercise')}</Text>

      <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('common.searchExercise') ?? undefined}
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
            {t('common.bodyPartsTab')}
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
            {t('common.equipmentTab')}
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
                  <Text style={[styles.exerciseTitle, { color: theme.text }]}>
                    {t(`exercises.${ex.id}.title`)}
                  </Text>
                  <Text style={[styles.exerciseMeta, { color: theme.textSecondary }]}>
                    {t(`exercises.${ex.id}.meta`)}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                  size={18}
                  color={theme.textSecondary}
                />
              </View>
              {isExpanded && (
                <Text style={[styles.exerciseDescription, { color: theme.textSecondary }]}>
                  {t(`exercises.${ex.id}.description`)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredExercises.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t('common.noExercisesFilter')}
          </Text>
        )}
      </ScrollView>

      {/* Body Part filter sheet */}
      <FilterSheet
        visible={activeFilter === 'bodyPart'}
        onClose={() => setActiveFilter(null)}
        title={t('common.filterBodyPart')}
        secondaryLabel={
          selectedBodyParts.length === bodyPartOptions.length ? t('common.deselectAll') : t('common.selectAll')
        }
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
                  <Text style={[styles.circleLabel, { color: theme.textSecondary }]}>
                    {t(`bodyPartsList.${opt.labelKey}`)}
                  </Text>
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
        title={t('common.filterEquipment')}
        secondaryLabel={
          selectedEquipment.length === equipmentOptions.length ? t('common.deselectAll') : t('common.selectAll')
        }
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
                <Text style={[styles.equipmentCardLabel, { color: theme.textSecondary }]}>
                  {t(`equipmentList.${opt.id}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </FilterSheet>

      {/* Levels filter sheet */}
      <FilterSheet
        visible={activeFilter === 'levels'}
        onClose={() => setActiveFilter(null)}
        title={t('common.filterLevels')}
        secondaryLabel={t('common.clearAll')}
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
                <Text style={[styles.checkLabel, { color: theme.text }]}>{t(`levels.${opt.labelKey}`)}</Text>
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
  const { t } = useTranslation();
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
          <Text style={styles.showResultsText}>{t('common.showResults')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
 container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
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
