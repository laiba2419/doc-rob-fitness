import BottomNav from '@/components/BottomNav';
import LineChart from '@/components/LineChart';
import {
  fetchStepsEntries,
  fetchWeightEntries,
  formatDate,
  latestValue,
  StepsEntry,
  WeightEntry,
} from '@/services/reportservice';
import { bmiCategory, calculateBMI } from '@/data/userProfile';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const SCREEN_W = Dimensions.get('window').width;
const RING_SIZE = 76;
const RING_STROKE = 7;

export default function ReportHomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useUserProfile();

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [stepsEntries, setStepsEntries] = useState<StepsEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const [w, s] = await Promise.all([fetchWeightEntries(), fetchStepsEntries()]);
        if (isActive) {
          setWeightEntries(w);
          setStepsEntries(s);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const currentWeight = latestValue(weightEntries);
  const currentSteps = latestValue(stepsEntries);

  const weightData = weightEntries.slice(-7).map((e) => ({ label: formatDate(e.date), value: e.value }));

  const heightCm = profile.height;
  const bmi = heightCm != null && currentWeight != null ? calculateBMI(currentWeight, heightCm) : null;

  const BMI_MIN = 10;
  const BMI_MAX = 40;
  const ringProgress = bmi != null ? Math.min(Math.max((bmi - BMI_MIN) / (BMI_MAX - BMI_MIN), 0), 1) : 0;

  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ringProgress);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{t('tabs.report')}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.cardsRow}>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/report/steps' as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
              <Ionicons name="footsteps-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {currentSteps?.toLocaleString() ?? '—'}
            </Text>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{t('report.totalSteps')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, styles.bmiCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/report/bmi' as any)}
          >
            <View style={styles.bmiRingWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={radius}
                  stroke={theme.surface}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={radius}
                  stroke={theme.primary}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.bmiRingCenter}>
                <Text style={[styles.bmiValue, { color: theme.text }]}>
                  {bmi != null ? bmi.toFixed(1) : '—'}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
              {bmi != null ? `${t('report.bmiTitle')} · ${bmiCategory(bmi)}` : t('report.addHeightForBmi')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.graphCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/report/weight' as any)}
        >
          <View style={styles.graphCardHeader}>
            <Text style={[styles.graphTitle, { color: theme.text }]}>{t('report.weightTitle')}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
          <LineChart data={weightData} width={SCREEN_W - 72} height={150} showLabels />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/report/add-weight' as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', marginHorizontal: 20, paddingTop: 56, marginBottom: 16 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  bmiCard: { alignItems: 'center' },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: { fontSize: 22, fontWeight: '800' },
  cardLabel: { fontSize: 12, fontWeight: '500' },
  bmiRingWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiValue: { fontSize: 18, fontWeight: '800' },
  graphCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  graphCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphTitle: { fontSize: 16, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});