import BackHeader from '@/components/BackHeader';
import { supabase } from '@/lib/supabase';
import {
  cancelReminderNotifications,
  parseDaysToIndexes,
  parseIntervalLabel,
  parseTimeString,
  scheduleIntervalReminder,
  scheduleReminderNotifications,
} from '@/lib/notifications';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type ReminderType = 'water' | 'exercise';

type Reminder = {
  id: string;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
  type: ReminderType;
  notification_ids: string[];
};

export default function RemindersScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReminderType>('exercise');

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // No authenticated user -- never show stale/previous-user data.
      setReminders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert(t('profile.common.error'), error.message);
      setReminders([]);
    } else {
      setReminders((data ?? []) as Reminder[]);
    }
    setLoading(false);
  }, [t]);

  // Refetch every time this screen comes into focus (e.g. after adding one,
  // or after switching accounts and navigating back here). This also
  // guarantees a signed-out/switched user never sees a previous user's list,
  // since fetchReminders always re-checks supabase.auth.getUser() and scopes
  // the query to that user's id.
  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [fetchReminders])
  );

  const filteredReminders = useMemo(() => reminders.filter((r) => r.type === activeTab), [reminders, activeTab]);

  const toggleReminder = async (item: Reminder) => {
    const newEnabled = !item.enabled;

    // optimistic update
    setReminders((prev) => prev.map((r) => (r.id === item.id ? { ...r, enabled: newEnabled } : r)));

    let newNotificationIds: string[] = item.notification_ids ?? [];

    try {
      if (!newEnabled) {
        // Turning off -- cancel the actual scheduled device notifications
        await cancelReminderNotifications(item.notification_ids ?? []);
        newNotificationIds = [];
      } else if (item.type === 'water') {
        // Turning back on -- cancel any stale ids first, then reschedule the
        // repeating interval reminder so we never end up with duplicates.
        await cancelReminderNotifications(item.notification_ids ?? []);
        const intervalMinutes = parseIntervalLabel(item.time) ?? 30;
        newNotificationIds = await scheduleIntervalReminder({
          title: item.title,
          body: 'Time to drink water! 💧',
          intervalMinutes,
        });
      } else {
        // Turning back on -- cancel any stale ids first, then reschedule
        // fresh notifications from the saved time/days.
        await cancelReminderNotifications(item.notification_ids ?? []);
        const { hour24, minute } = parseTimeString(item.time);
        const dayIndexes = parseDaysToIndexes(item.days);
        newNotificationIds = await scheduleReminderNotifications({
          title: item.title,
          body: `Time for: ${item.title} 🏋️`,
          hour24,
          minute,
          dayIndexes,
        });
      }

      const { error } = await supabase
        .from('reminders')
        .update({ enabled: newEnabled, notification_ids: newNotificationIds })
        .eq('id', item.id);

      if (error) {
        // revert on failure
        setReminders((prev) => prev.map((r) => (r.id === item.id ? item : r)));
        Alert.alert(t('profile.common.error'), error.message);
      } else {
        setReminders((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, enabled: newEnabled, notification_ids: newNotificationIds } : r))
        );
      }
    } catch (e) {
      // revert on any unexpected failure (e.g. permission denied mid-toggle)
      setReminders((prev) => prev.map((r) => (r.id === item.id ? item : r)));
      Alert.alert(t('profile.common.error'), e instanceof Error ? e.message : String(e));
    }
  };

  const deleteReminder = (item: Reminder) => {
    Alert.alert(
      t('profile.reminders.deleteTitle'),
      t('profile.reminders.deleteMessage', { title: item.title }),
      [
        { text: t('profile.common.cancel'), style: 'cancel' },
        {
          text: t('profile.common.delete'),
          style: 'destructive',
          onPress: async () => {
            // Remove from UI immediately
            setReminders((prev) => prev.filter((r) => r.id !== item.id));

            // Cancel its scheduled device notification(s) so it stops firing
            await cancelReminderNotifications(item.notification_ids ?? []);

            const { error } = await supabase.from('reminders').delete().eq('id', item.id);

            if (error) {
              // put it back if delete failed
              setReminders((prev) => [item, ...prev]);
              Alert.alert(t('profile.common.error'), error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile.reminders.title')}</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/profile/set-reminder' as any)}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Water / Exercise tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, { backgroundColor: activeTab === 'water' ? theme.primary : theme.surface }]}
          onPress={() => setActiveTab('water')}
        >
          <Ionicons name="water-outline" size={16} color={activeTab === 'water' ? '#FFFFFF' : theme.text} />
          <Text style={{ color: activeTab === 'water' ? '#FFFFFF' : theme.text, fontWeight: '700', marginLeft: 6 }}>
            {t('profile.reminders.water')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, { backgroundColor: activeTab === 'exercise' ? theme.primary : theme.surface }]}
          onPress={() => setActiveTab('exercise')}
        >
          <Ionicons name="barbell-outline" size={16} color={activeTab === 'exercise' ? '#FFFFFF' : theme.text} />
          <Text style={{ color: activeTab === 'exercise' ? '#FFFFFF' : theme.text, fontWeight: '700', marginLeft: 6 }}>
            {t('profile.reminders.exercise')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : filteredReminders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
            <Ionicons
              name={activeTab === 'water' ? 'water-outline' : 'notifications-outline'}
              size={40}
              color={theme.primary}
            />
          </View>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t('profile.reminders.emptyState', {
              type: activeTab === 'water' ? t('profile.reminders.water') : t('profile.reminders.exercise'),
            })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
                <Ionicons
                  name={item.type === 'water' ? 'water-outline' : 'alarm-outline'}
                  size={18}
                  color={theme.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                  {item.type === 'water' ? item.time : `${item.time} · ${item.days.join(', ')}`}
                </Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleReminder(item)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteReminder(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tabsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', height: 40, borderRadius: 12 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 30 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  deleteBtn: { marginLeft: 4, padding: 4 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 2 },
});
