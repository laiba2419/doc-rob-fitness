import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// NOTE: these ids must stay in sync with the equipmentExercises list on Home
// and the equipmentOptions list in /exercises/list, otherwise filtering breaks.
// Labels now come from equipmentList.<id> in the translation files instead
// of being hardcoded here.
const equipmentList = [
  { id: 'dumbbell', image: require('../../../assets/images/equipment/Dumbbells.png') },
  { id: 'jumprope', image: require('../../../assets/images/equipment/Jumprope.png') },
  { id: 'kettlebell', image: require('../../../assets/images/equipment/kettlebells.png') },
  { id: 'bench', image: require('../../../assets/images/equipment/bench.png') },
  { id: 'barbell', image: require('../../../assets/images/equipment/Barbell.png') },
  { id: 'gymball', image: require('../../../assets/images/equipment/exercise ball.png') },
  { id: 'weightplate', image: require('../../../assets/images/equipment/weight plate.png') },
];

export default function EquipmentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSelect = (id: string) => {
    router.push({ pathname: '/exercises/list', params: { equipment: id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('common.equipmentBasedExercise')}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {equipmentList.map((eq) => (
          <TouchableOpacity key={eq.id} style={styles.card} onPress={() => handleSelect(eq.id)}>
            <Image source={eq.image} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.overlay}>
              <Text style={styles.label}>{t(`equipmentList.${eq.id}`)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14, paddingBottom: 30 },
  card: {
    width: '47%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
  },
  cardImage: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});