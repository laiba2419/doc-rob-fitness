import BackHeader from '@/components/BackHeader';
import { cancelReminderNotifications, scheduleOneOffNotification } from '@/lib/notifications';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const presets = [5, 10, 15, 20];

export default function TimerScreen() {
  const { theme } = useTheme();
  const [totalSeconds, setTotalSeconds] = useState(10 * 60);
  const [remaining, setRemaining] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('10');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const selectPreset = (mins: number) => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCustomMinutes(String(mins));
    setTotalSeconds(mins * 60);
    setRemaining(mins * 60);
  };

  const applyCustom = () => {
    const mins = parseInt(customMinutes, 10);
    if (!mins || mins <= 0) return;
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTotalSeconds(mins * 60);
    setRemaining(mins * 60);
  };

  const start = async () => {
    if (remaining <= 0) return;
    setRunning(true);

    // Backup notification -- fires even if the user backgrounds the app
    // while the timer is running.
    const id = await scheduleOneOffNotification({
      title: 'Timer done! ⏱️',
      body: 'Your workout timer has finished.',
      seconds: remaining,
    });
    notificationIdRef.current = id;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (notificationIdRef.current) {
      cancelReminderNotifications([notificationIdRef.current]);
      notificationIdRef.current = null;
    }
  };

  const reset = () => {
    pause();
    setRemaining(totalSeconds);
  };

  const minutesDisplay = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secondsDisplay = String(remaining % 60).padStart(2, '0');

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Workout Timer</Text>

      <View style={styles.presetsRow}>
        {presets.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => selectPreset(p)}
            style={[styles.presetBtn, { backgroundColor: totalSeconds === p * 60 ? theme.primary : theme.surface }]}
          >
            <Text style={{ color: totalSeconds === p * 60 ? '#FFFFFF' : theme.text, fontWeight: '700' }}>
              {p} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customRow}>
        <TextInput
          style={[styles.customInput, { borderColor: theme.border, color: theme.text }]}
          value={customMinutes}
          onChangeText={setCustomMinutes}
          keyboardType="number-pad"
          placeholder="Custom minutes"
          placeholderTextColor={theme.textSecondary}
        />
        <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.surface }]} onPress={applyCustom}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>Set</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.timerCircle, { borderColor: theme.primary }]}>
        <Text style={[styles.timerText, { color: theme.text }]}>
          {minutesDisplay}:{secondsDisplay}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        {!running ? (
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: theme.primary }]} onPress={start}>
            <Ionicons name="play" size={22} color="#FFFFFF" />
            <Text style={styles.controlText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: theme.surface }]} onPress={pause}>
            <Ionicons name="pause" size={22} color={theme.text} />
            <Text style={[styles.controlText, { color: theme.text }]}>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: theme.surface }]} onPress={reset}>
          <Ionicons name="refresh" size={22} color={theme.text} />
          <Text style={[styles.controlText, { color: theme.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  presetsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  customRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  customInput: { flex: 1, height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  applyBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  timerText: { fontSize: 42, fontWeight: '800' },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  controlText: { color: '#FFFFFF', fontWeight: '700' },
});
