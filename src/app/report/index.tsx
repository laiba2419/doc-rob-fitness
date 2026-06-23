import BottomNav from '@/components/BottomNav';
import LineChart from '@/components/LineChart';
import {
    calorieEntries,
    formatDate,
    latestCalories,
    latestSteps,
    latestWeight,
    stepsEntries,
    weightEntries,
} from '@/data/report';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;

export default function ReportHomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const currentWeight = latestWeight(weightEntries);
  const currentCalories = latestCalories(calorieEntries);
  const currentSteps = latestSteps(stepsEntries);

  const weightData = weightEntries.slice(-7).map((e) => ({ label: formatDate(e.date), value: e.value }));
  const calorieData = calorieEntries.slice(-7).map((e) => ({ label: formatDate(e.date), value: e.value }));
  const stepsData = stepsEntries.slice(-7).map((e) => ({ label: formatDate(e.date), value: e.value }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Report</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          {/* Steps Card */}
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
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Steps Today</Text>
          </TouchableOpacity>

          {/* Calories Card */}
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/report/calories' as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
              <Ionicons name="flame-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {currentCalories?.toLocaleString() ?? '—'}
            </Text>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>kcal Today</Text>
          </TouchableOpacity>
        </View>

        {/* Weight Section */}
        <TouchableOpacity
          style={[styles.graphCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/report/weight' as any)}
        >
          <View style={styles.graphCardHeader}>
            <View>
              <Text style={[styles.graphTitle, { color: theme.text }]}>Weight</Text>
              <Text style={[styles.graphSubtitle, { color: theme.textSecondary }]}>
                {currentWeight != null ? `${currentWeight} kg` : '—'} · Last 7 entries
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
          <LineChart data={weightData} width={SCREEN_W - 72} height={130} showLabels />
        </TouchableOpacity>

        {/* Calories Section */}
        <TouchableOpacity
          style={[styles.graphCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/report/calories' as any)}
        >
          <View style={styles.graphCardHeader}>
            <View>
              <Text style={[styles.graphTitle, { color: theme.text }]}>Calories</Text>
              <Text style={[styles.graphSubtitle, { color: theme.textSecondary }]}>
                {currentCalories != null ? `${currentCalories?.toLocaleString()} kcal` : '—'} · Last 7 days
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
          <LineChart data={calorieData} width={SCREEN_W - 72} height={130} showLabels />
        </TouchableOpacity>

        {/* Steps Section */}
        <TouchableOpacity
          style={[styles.graphCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/report/steps' as any)}
        >
          <View style={styles.graphCardHeader}>
            <View>
              <Text style={[styles.graphTitle, { color: theme.text }]}>Steps</Text>
              <Text style={[styles.graphSubtitle, { color: theme.textSecondary }]}>
                {currentSteps != null ? `${currentSteps?.toLocaleString()} steps` : '—'} · Last 7 days
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
          <LineChart data={stepsData} width={SCREEN_W - 72} height={130} showLabels />
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', marginHorizontal: 20, paddingTop: 56, marginBottom: 16 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: { fontSize: 22, fontWeight: '800' },
  cardLabel: { fontSize: 12, fontWeight: '500' },
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
  graphSubtitle: { fontSize: 12, marginTop: 2 },
});
