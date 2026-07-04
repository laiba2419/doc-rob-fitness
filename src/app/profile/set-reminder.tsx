import BackHeader from '@/components/BackHeader';
import { reminderEntries } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SetReminderScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const adjustHour = (delta: number) => setHour((h) => ((h - 1 + delta + 12) % 12) + 1);
  const adjustMinute = (delta: number) => setMinute((m) => (m + delta + 60) % 60);

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => (prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a reminder title.');
      return;
    }
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
    const days = selectedDays.length === 7 ? ['Daily'] : selectedDays.sort().map((d) => dayNames[d]);

    reminderEntries.push({
      id: `r${Date.now()}`,
      title: title.trim(),
      time,
      days,
      enabled: true,
    });

    Alert.alert('Reminder Set', `"${title}" reminder added for ${time}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Set Reminder</Text>

      <Text style={[styles.label, { color: theme.text }]}>Reminder Title</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Morning Workout"
        placeholderTextColor={theme.placeholder}
      />

      <Text style={[styles.label, { color: theme.text }]}>Time</Text>
      <View style={[styles.timeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.timeStepper}>
          <TouchableOpacity onPress={() => adjustHour(1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="chevron-up" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.timeValue, { color: theme.text }]}>{String(hour).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => adjustHour(-1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="chevron-down" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.colon, { color: theme.text }]}>:</Text>
        <View style={styles.timeStepper}>
          <TouchableOpacity onPress={() => adjustMinute(1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="chevron-up" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.timeValue, { color: theme.text }]}>{String(minute).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => adjustMinute(-1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="chevron-down" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.periodCol}>
          {(['AM', 'PM'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodBtn, { backgroundColor: period === p ? theme.primary : theme.surface }]}
            >
              <Text style={{ color: period === p ? '#FFFFFF' : theme.text, fontWeight: '700', fontSize: 12 }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Repeat</Text>
      <View style={styles.daysRow}>
        {dayLabels.map((label, index) => {
          const active = selectedDays.includes(index);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => toggleDay(index)}
              style={[
                styles.dayCircle,
                { backgroundColor: active ? theme.primary : theme.surface, borderColor: active ? theme.primary : theme.border },
              ]}
            >
              <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '700', fontSize: 12 }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, marginBottom: 16 },
  timeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1,
    paddingVertical: 18, marginBottom: 16, gap: 10,
  },
  timeStepper: { alignItems: 'center', gap: 4 },
  stepBtn: { width: 32, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  timeValue: { fontSize: 26, fontWeight: '800', marginVertical: 2 },
  colon: { fontSize: 26, fontWeight: '800' },
  periodCol: { gap: 6, marginLeft: 14 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dayCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
