import BackHeader from '@/components/BackHeader';
import BottomNav from '@/components/BottomNav';
import LineChart from '@/components/LineChart';
import { calorieEntries, formatDate, generateId } from '@/data/report';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function AddCaloriesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const chartData = [...calorieEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((e) => ({ label: formatDate(e.date), value: e.value }));

  const handleSave = () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0 || num > 10000) {
      Alert.alert('Invalid', 'Please enter a valid calorie count (kcal).');
      return;
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid', 'Please enter date as YYYY-MM-DD.');
      return;
    }
    calorieEntries.push({ id: generateId(), date, value: num });
    Alert.alert('Saved!', `${num.toLocaleString()} kcal logged for ${formatDate(date)}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Log Calories</Text>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>Recent trend</Text>
          <LineChart data={chartData} width={SCREEN_W - 72} height={120} showLabels={false} />
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Calories (kcal)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g. 2000"
            placeholderTextColor={theme.placeholder}
            keyboardType="number-pad"
            value={value}
            onChangeText={setValue}
          />

          <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 14 }]}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            placeholder="2025-06-30"
            placeholderTextColor={theme.placeholder}
            value={date}
            onChangeText={setDate}
          />

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
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
  saveBtn: { marginTop: 20, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
