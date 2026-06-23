import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// NOTE: these ids must stay in sync with the bodyParts list on Home and the
// bodyPartOptions list in /exercises/list, otherwise filtering breaks.
const bodyParts = [
  { id: 'leg', label: 'Leg', image: require('../../../assets/images/body-parts/leg.png') },
  { id: 'shoulders', label: 'Shoulders', image: require('../../../assets/images/body-parts/shoulders.png') },
  { id: 'biceps', label: 'Biceps', image: require('../../../assets/images/body-parts/Biceps.png') },
  { id: 'abs', label: 'Abs', image: require('../../../assets/images/body-parts/abs.png') },
  { id: 'back', label: 'Back', image: require('../../../assets/images/body-parts/Backs.png') },
  { id: 'triceps', label: 'Triceps', image: require('../../../assets/images/body-parts/Triceps.png') },
  { id: 'chest', label: 'Chest', image: require('../../../assets/images/body-parts/Chest.png') },
  { id: 'quadriceps', label: 'Quadriceps', image: require('../../../assets/images/body-parts/Quadriceps.png') },
  { id: 'hamstrings', label: 'Hamstrings', image: require('../../../assets/images/body-parts/Hamstrings.png') },
  { id: 'upper-body', label: 'Upper Body', image: require('../../../assets/images/body-parts/upper-body.png') },
];

export default function BodyPartScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleSelect = (id: string) => {
    // Param key must be "part" -- that's what /exercises/list reads.
    router.push({ pathname: '/exercises/list', params: { part: id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Body Part</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {bodyParts.map((part) => (
          <TouchableOpacity key={part.id} style={styles.item} onPress={() => handleSelect(part.id)}>
            <Image source={part.image} style={styles.circle} resizeMode="cover" />
            <Text style={[styles.label, { color: theme.textSecondary }]}>{part.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 30,
  },
  item: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 28,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  label: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
