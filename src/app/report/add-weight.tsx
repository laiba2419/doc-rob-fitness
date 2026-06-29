import BackHeader from '@/components/BackHeader';
import { weightEntries } from '@/data/report';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AddWeightScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isValid = weight.trim().length > 0 && !Number.isNaN(Number(weight));

  const handleSave = () => {
    if (!isValid) return;

    // NOTE: weightEntries is currently static demo data from data/report.ts.
    // Pushing here updates the in-memory array for this session; wire this
    // to your real persistence layer (AsyncStorage/DB) when ready.
    weightEntries.push({
      id: `w-${Date.now()}`,
      date: toISODate(date),
      value: Number(weight),
    });

    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Add Weight</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Weight input */}
        <View style={styles.fieldRow}>
          <TextInput
            style={[styles.weightInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="50"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <Text style={[styles.unitLabel, { color: theme.textSecondary }]}>kg</Text>
        </View>

        {/* Date picker trigger */}
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

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isValid ? theme.primary : theme.border }]}
          onPress={handleSave}
          disabled={!isValid}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 },
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weightInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    borderBottomWidth: 1.5,
    paddingVertical: 6,
  },
  unitLabel: { fontSize: 16, fontWeight: '600' },
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
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
