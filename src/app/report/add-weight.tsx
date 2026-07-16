import BackHeader from '@/components/BackHeader';
import { addWeightEntry } from '@/services/reportservice';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AddWeightScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const isValid = weight.trim().length > 0 && !Number.isNaN(Number(weight));

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    const { error } = await addWeightEntry(toISODate(date), Number(weight));

    setSaving(false);
    if (error) {
      Alert.alert(t('report.couldNotSave'), error);
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('report.addWeightTitle')}</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.fieldRow}>
          <TextInput
            style={[styles.weightInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="50"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <Text style={[styles.unitLabel, { color: theme.textSecondary }]}>{t('report.kgUnit')}</Text>
        </View>

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
          style={[styles.saveBtn, { backgroundColor: isValid ? theme.primary : theme.border }]}
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          <Text style={styles.saveBtnText}>{saving ? t('report.savingBtn') : t('report.saveBtn')}</Text>
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