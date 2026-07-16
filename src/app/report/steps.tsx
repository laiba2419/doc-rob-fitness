import BackHeader from '@/components/BackHeader';
import BottomNav from '@/components/BottomNav';
import LineChart from '@/components/LineChart';
import { fetchStepsEntries, formatDate, StepsEntry } from '@/services/reportservice';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;

export default function StepsDetailScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [entries, setEntries] = useState<StepsEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      fetchStepsEntries().then((data) => {
        if (isActive) setEntries(data);
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const chartData = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10)
    .map((e) => ({ label: formatDate(e.date), value: e.value }));

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('report.stepsTitle')}</Text>

      <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>
          {t('report.lastDays', { count: chartData.length })}
        </Text>
        <LineChart data={chartData} width={SCREEN_W - 72} height={150} showLabels />
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={[styles.sectionTitle, { color: theme.text }]}>{t('report.allEntries')}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.entryRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View>
              <Text style={[styles.entryDate, { color: theme.textSecondary }]}>{formatDate(item.date)}</Text>
              <Text style={[styles.entryValue, { color: theme.text }]}>
                {item.value.toLocaleString()} {t('report.stepsUnit')}
              </Text>
            </View>
            <Ionicons name="footsteps-outline" size={20} color={theme.primary} />
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/report/add-steps' as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: -12 },
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 12 },
  chartCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  chartLabel: { fontSize: 12, marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 160 },
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