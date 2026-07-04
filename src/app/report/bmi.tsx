import BackHeader from '@/components/BackHeader';
import LineChart from '@/components/LineChart';
import { formatDate, weightEntries } from '@/data/report';
import { bmiCategory, calculateBMI } from '@/data/userProfile';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;

export default function BMIDetailScreen() {
  const { theme } = useTheme();
  const { profile } = useUserProfile();
  const heightCm = profile.height;

  // BMI history is derived from weight entries + the saved height, since
  // there's no separate BMI log — every weight entry becomes a BMI point.
  const bmiEntries = heightCm
    ? [...weightEntries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({
          id: e.id,
          date: e.date,
          value: calculateBMI(e.value, heightCm),
        }))
    : [];

  const chartData = bmiEntries.slice(-10).map((e) => ({ label: formatDate(e.date), value: e.value }));
  const sorted = [...bmiEntries].sort((a, b) => b.date.localeCompare(a.date));
  const currentBMI = sorted[0]?.value ?? null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>BMI</Text>

      {!heightCm ? (
        // No height saved yet — nothing to calculate, so guide the user
        // instead of showing an empty/broken chart.
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="body-outline" size={32} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Height not set</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Add your height in setup to calculate your BMI.
          </Text>
        </View>
      ) : (
        <>
          {/* Current BMI summary */}
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {currentBMI != null ? currentBMI.toFixed(1) : '—'}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {currentBMI != null ? bmiCategory(currentBMI) : '—'} · Height {heightCm} cm
            </Text>
          </View>

          {/* Chart */}
          <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>
              Last {chartData.length} entries
            </Text>
            <LineChart data={chartData} width={SCREEN_W - 72} height={150} showLabels />
          </View>

          {/* History list */}
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<Text style={[styles.sectionTitle, { color: theme.text }]}>All Entries</Text>}
            renderItem={({ item }) => (
              <View style={[styles.entryRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.entryDate, { color: theme.textSecondary }]}>{formatDate(item.date)}</Text>
                  <Text style={[styles.entryValue, { color: theme.text }]}>
                    {item.value.toFixed(1)} · {bmiCategory(item.value)}
                  </Text>
                </View>
                <Ionicons name="body-outline" size={20} color={theme.primary} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 12 },

  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  emptyText: { fontSize: 13, textAlign: 'center' },

  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 32, fontWeight: '800' },
  summaryLabel: { fontSize: 13, marginTop: 4 },

  chartCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  chartLabel: { fontSize: 12, marginBottom: 8 },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  entryDate: { fontSize: 12, marginBottom: 2 },
  entryValue: { fontSize: 16, fontWeight: '700' },
});
