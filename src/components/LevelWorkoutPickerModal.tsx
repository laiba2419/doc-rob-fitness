import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedPressable from '@/components/AnimatedPressable';
import { BodyPart, WorkoutLevel } from '@/services/homeService';

interface LevelWorkoutPickerModalProps {
  visible: boolean;
  onClose: () => void;

  step: 'level' | 'bodyparts';
  onBack: () => void;

  workoutLevels: WorkoutLevel[];
  onPickLevel: (levelId: string) => void;
  getLevelImage: (levelId: string | null | undefined) => any;

  selectedLevelId: string | null;

  bodyParts: BodyPart[];
  onPickBodyPart: (partId: string) => void;
}

export default function LevelWorkoutPickerModal({
  visible,
  onClose,
  step,
  onBack,
  workoutLevels,
  onPickLevel,
  getLevelImage,
  selectedLevelId,
  bodyParts,
  onPickBodyPart,
}: LevelWorkoutPickerModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        {step === 'level' ? (
          <>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              {t('levels.chooseLevel')}
            </Text>
            <View style={styles.levelGrid}>
              {workoutLevels.map((level) => (
                <View key={level.id} style={styles.levelCardWrap}>
                  <AnimatedPressable onPress={() => onPickLevel(level.id)} style={styles.levelCard}>
                    <Image source={getLevelImage(level.id)} style={styles.levelCardImage} resizeMode="cover" />
                    <View style={styles.levelCardOverlay}>
                      <Text style={styles.bigCardTitle} numberOfLines={1}>
                        {level.label}
                      </Text>
                      <Text style={styles.bigCardMeta} numberOfLines={1}>
                        {level.meta}
                      </Text>
                    </View>
                  </AnimatedPressable>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
              <TouchableOpacity onPress={onBack}>
                <Ionicons name="arrow-back" size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: theme.text, marginBottom: 0 }]}>
                {t('common.chooseBodyPartFor', {
                  level: workoutLevels.find((l) => l.id === selectedLevelId)?.label ?? t('levels.beginner'),
                })}
              </Text>
            </View>

            {/* Same body_parts list as the home screen's "Body parts
                Exercise" section — identical for every level. */}
            {bodyParts.map((part) => (
              <TouchableOpacity key={part.id} style={styles.sheetRow} onPress={() => onPickBodyPart(part.id)}>
                <Text style={[styles.exTitle, { color: theme.text, fontSize: 14 }]}>{part.label}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  exTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },

  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  levelCardWrap: { width: '48%', marginBottom: 12 },
  levelCard: { height: 110, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  levelCardImage: { width: '100%', height: '100%', position: 'absolute' },
  levelCardOverlay: {
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
});
