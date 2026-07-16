import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// NOTE: these ids must stay in sync with the bodyParts list on Home and the
// bodyPartOptions list in /exercises/list, otherwise filtering breaks.
// Labels now come from bodyPartsList.<id> in the translation files instead
// of being hardcoded here.
const bodyParts = [
  { id: 'leg', image: require('../../../assets/images/body-parts/leg.png') },
  { id: 'shoulders', image: require('../../../assets/images/body-parts/shoulders.png') },
  { id: 'biceps', image: require('../../../assets/images/body-parts/Biceps.png') },
  { id: 'abs', image: require('../../../assets/images/body-parts/abs.png') },
  { id: 'back', image: require('../../../assets/images/body-parts/Backs.png') },
  { id: 'triceps', image: require('../../../assets/images/body-parts/Triceps.png') },
  { id: 'chest', image: require('../../../assets/images/body-parts/Chest.png') },
  { id: 'quadriceps', image: require('../../../assets/images/body-parts/Quadriceps.png') },
  { id: 'hamstrings', image: require('../../../assets/images/body-parts/Hamstrings.png') },
  { id: 'upper-body', image: require('../../../assets/images/body-parts/upper-body.png') },
];

// bodyPartsList.json uses camelCase keys -- "upper-body" doesn't work as a
// bare key so it maps to "upperBody" here.
const bodyPartLabelKeys: Record<string, string> = {
  leg: 'leg',
  shoulders: 'shoulders',
  biceps: 'biceps',
  abs: 'abs',
  back: 'back',
  triceps: 'triceps',
  chest: 'chest',
  quadriceps: 'quadriceps',
  hamstrings: 'hamstrings',
  'upper-body': 'upperBody',
};

export default function BodyPartScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSelect = (id: string) => {
    // Param key must be "part" -- that's what /exercises/list reads.
    router.push({ pathname: '/exercises/list', params: { part: id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('common.bodyPart')}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {bodyParts.map((part) => (
          <TouchableOpacity key={part.id} style={styles.item} onPress={() => handleSelect(part.id)}>
            <Image source={part.image} style={styles.circle} resizeMode="cover" />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {t(`bodyPartsList.${bodyPartLabelKeys[part.id]}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
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
