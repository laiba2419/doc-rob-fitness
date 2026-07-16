import BackHeader from '@/components/BackHeader';
import BottomNav from '@/components/BottomNav';
import LineChart from '@/components/LineChart';
import { addCalorieEntry, CalorieEntry, fetchCalorieEntries, formatDate } from '@/services/reportservice';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const SCREEN_W = Dimensions.get('window').width;

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AddCaloriesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      fetchCalorieEntries().then((data) => {
        if (isActive) setCalorieEntries(data);
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const chartData = [...calorieEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((e) => ({ label: formatDate(e.date), value: e.value }));

  const handleSave = async () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0 || num > 10000) {
      Alert.alert(t('report.invalidTitle'), t('report.invalidCalories'));
      return;
    }
    const isoDate = toISODate(date);
    setSaving(true);
    const { error } = await addCalorieEntry(isoDate, num);
    setSaving(false);

    if (error) {
      Alert.alert(t('report.couldNotSave'), error);
      return;
    }
    Alert.alert(
      t('report.savedTitle'),
      t('report.savedCaloriesMsg', { count: num.toLocaleString(), date: formatDate(isoDate) }),
      [{ text: t('report.ok'), onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>{t('report.logCalories')}</Text>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>{t('report.recentTrend')}</Text>
          <LineChart data={chartData} width={SCREEN_W - 72} height={120} showLabels={false} />
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('report.caloriesField')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            placeholder={t('report.caloriesPlaceholder') as string}
            placeholderTextColor={theme.placeholder}
            keyboardType="number-pad"
            value={value}
            onChangeText={setValue}
          />

          <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 14 }]}>{t('report.dateField')}</Text>
          <TouchableOpacity
            style={[styles.dateRow, { borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: theme.text }]}>{toISODate(date)}</Text>
            <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDate(selected);
              }}
            />
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? t('report.savingBtn') : t('report.saveBtn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  chartLabel: { fontSize: 12, marginBottom: 8 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: { fontSize: 14, fontWeight: '500' },
  saveBtn: { marginTop: 20, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});