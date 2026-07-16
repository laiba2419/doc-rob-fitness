import BackHeader from '@/components/BackHeader';
import { supabase } from '@/lib/supabase';
import { formatIntervalLabel, scheduleIntervalReminder, scheduleReminderNotifications } from '@/lib/notifications';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// NOTE: dayNames stays in English on purpose -- this array is the value that
// actually gets SAVED to Supabase (`days` column) and later re-parsed by
// parseDaysToIndexes(). Translating it would break stored data / cross-language
// consistency. Only the visual day-picker letters (dayLabels below, via
// t('profile.setReminder.days.*')) are translated since those are display-only.
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const intervalPresets = [10, 30, 60, 120]; // minutes

type ReminderType = 'water' | 'exercise';

export default function SetReminderScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [type, setType] = useState<ReminderType>('exercise');
  const [title, setTitle] = useState('');

  // Exercise reminders: specific clock time + days of week
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Water reminders: repeating interval instead of a fixed time
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [customInterval, setCustomInterval] = useState('30');

  const [saving, setSaving] = useState(false);

  const adjustHour = (delta: number) => setHour((h) => ((h - 1 + delta + 12) % 12) + 1);
  const adjustMinute = (delta: number) => setMinute((m) => (m + delta + 60) % 60);

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => (prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]));
  };

  const applyCustomInterval = () => {
    const mins = parseInt(customInterval, 10);
    if (mins && mins > 0) setIntervalMinutes(mins);
  };

  const intervalLabel = (mins: number) => (mins < 60 ? `${mins} min` : `${mins / 60} hr`);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('profile.setReminder.titleRequiredTitle'), t('profile.setReminder.titleRequiredMessage'));
      return;
    }

    if (type === 'exercise' && selectedDays.length === 0) {
      Alert.alert(t('profile.setReminder.titleRequiredTitle'), t('profile.setReminder.titleRequiredMessage'));
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert(t('profile.setReminder.notLoggedInTitle'), t('profile.setReminder.notLoggedInMessage'));
      return;
    }

    setSaving(true);

    let time: string;
    let days: string[];
    let notificationIds: string[];

    if (type === 'water') {
      // Interval-based: "Every 30 min" style, no specific days
      time = formatIntervalLabel(intervalMinutes);
      days = ['Anytime'];
      notificationIds = await scheduleIntervalReminder({
        title: title.trim(),
        body: 'Time to drink water! 💧',
        intervalMinutes,
      });
    } else {
      // Exercise: specific clock time + selected days
      time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
      days = selectedDays.length === 7 ? ['Daily'] : [...selectedDays].sort((a, b) => a - b).map((d) => dayNames[d]);

      let hour24 = hour % 12;
      if (period === 'PM') hour24 += 12;

      notificationIds = await scheduleReminderNotifications({
        title: title.trim(),
        body: `Time for: ${title.trim()} 🏋️`,
        hour24,
        minute,
        dayIndexes: selectedDays,
      });
    }

    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      title: title.trim(),
      time,
      days,
      enabled: true,
      type,
      notification_ids: notificationIds,
    });
    setSaving(false);

    if (error) {
      Alert.alert(t('profile.common.error'), error.message);
      return;
    }

    if (notificationIds.length === 0) {
      Alert.alert(t('profile.setReminder.savedNoNotifTitle'), t('profile.setReminder.savedNoNotifMessage'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    Alert.alert(t('profile.setReminder.savedTitle'), t('profile.setReminder.savedMessage', { title, time }), [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.setReminder.title')}</Text>

      <Text style={[styles.label, { color: theme.text }]}>{t('profile.setReminder.reminderType')}</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, { backgroundColor: type === 'water' ? theme.primary : theme.surface }]}
          onPress={() => setType('water')}
        >
          <Ionicons name="water-outline" size={18} color={type === 'water' ? '#FFFFFF' : theme.text} />
          <Text style={{ color: type === 'water' ? '#FFFFFF' : theme.text, fontWeight: '700', marginLeft: 6 }}>
            {t('profile.setReminder.water')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, { backgroundColor: type === 'exercise' ? theme.primary : theme.surface }]}
          onPress={() => setType('exercise')}
        >
          <Ionicons name="barbell-outline" size={18} color={type === 'exercise' ? '#FFFFFF' : theme.text} />
          <Text style={{ color: type === 'exercise' ? '#FFFFFF' : theme.text, fontWeight: '700', marginLeft: 6 }}>
            {t('profile.setReminder.exercise')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>{t('profile.setReminder.reminderTitleLabel')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
        value={title}
        onChangeText={setTitle}
        placeholder={
          type === 'water' ? t('profile.setReminder.titlePlaceholderWater') : t('profile.setReminder.titlePlaceholderExercise')
        }
        placeholderTextColor={theme.placeholder}
      />

      {type === 'water' ? (
        <>
          <Text style={[styles.label, { color: theme.text }]}>{t('profile.setReminder.remindEvery')}</Text>
          <View style={styles.intervalRow}>
            {intervalPresets.map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => {
                  setIntervalMinutes(mins);
                  setCustomInterval(String(mins));
                }}
                style={[
                  styles.intervalBtn,
                  { backgroundColor: intervalMinutes === mins ? theme.primary : theme.surface },
                ]}
              >
                <Text style={{ color: intervalMinutes === mins ? '#FFFFFF' : theme.text, fontWeight: '700' }}>
                  {intervalLabel(mins)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customRow}>
            <TextInput
              style={[styles.customInput, { borderColor: theme.border, color: theme.text }]}
              value={customInterval}
              onChangeText={setCustomInterval}
              keyboardType="number-pad"
              placeholder={t('profile.setReminder.customMinutesPlaceholder')}
              placeholderTextColor={theme.placeholder}
            />
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.surface }]} onPress={applyCustomInterval}>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{t('profile.setReminder.set')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            {t('profile.setReminder.helperText', { interval: intervalLabel(intervalMinutes) })}
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: theme.text }]}>{t('profile.setReminder.time')}</Text>
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

          <Text style={[styles.label, { color: theme.text }]}>{t('profile.setReminder.repeat')}</Text>
          <View style={styles.daysRow}>
            {dayKeys.map((key, index) => {
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
                  <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '700', fontSize: 12 }}>
                    {t(`profile.setReminder.days.${key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{t('profile.setReminder.saveReminder')}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', height: 44, borderRadius: 12 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, marginBottom: 16 },
  intervalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  intervalBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  customRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  customInput: { flex: 1, height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  applyBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  helperText: { fontSize: 12, lineHeight: 18, marginBottom: 20 },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    marginBottom: 16,
    gap: 10,
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
