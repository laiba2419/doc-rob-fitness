import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return finalStatus === 'granted';
}

type ScheduleParams = {
  title: string;
  body: string;
  hour24: number;
  minute: number;
  dayIndexes: number[];
};

export function formatIntervalLabel(minutes: number): string {
  return `Every ${minutes} min`;
}

export function parseIntervalLabel(label: string): number | null {
  const match = label.match(/(\d+)/);

  if (!match) return null;

  return Number(match[1]);
}

export function parseTimeString(time: string): { hour24: number; minute: number } {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!match) {
    return {
      hour24: 7,
      minute: 0,
    };
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);

  const period = match[3].toUpperCase();

  hour %= 12;

  if (period === 'PM') {
    hour += 12;
  }

  return {
    hour24: hour,
    minute,
  };
}

/**
 * Converts stored day labels (e.g. ["Mon", "Wed", "Fri"] or ["Daily"])
 * into numeric day indexes using the app-wide convention: 0 = Sun ... 6 = Sat.
 * This convention matches `dayKeys`/`dayNames` in set-reminder.tsx.
 */
export function parseDaysToIndexes(days: string[]): number[] {
  if (days.includes('Daily')) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  return days
    .map((d) => {
      switch (d) {
        case 'Sun':
          return 0;
        case 'Mon':
          return 1;
        case 'Tue':
          return 2;
        case 'Wed':
          return 3;
        case 'Thu':
          return 4;
        case 'Fri':
          return 5;
        case 'Sat':
          return 6;
        default:
          return -1;
      }
    })
    .filter((d) => d >= 0);
}

/**
 * Schedules a repeating WEEKLY notification for each selected day of week.
 * This is used for Exercise reminders (specific clock time + specific days).
 *
 * `dayIndexes` uses the app-wide convention 0 = Sun ... 6 = Sat. Internally
 * this is converted to expo-notifications' CALENDAR trigger `weekday` field,
 * which uses 1 = Sun ... 7 = Sat.
 *
 * Returns one notification id per unique day selected -- all of these ids
 * must be stored (e.g. in `notification_ids`) so they can all be cancelled
 * together later. Returns [] if permission was not granted or no days were
 * selected.
 */
export async function scheduleReminderNotifications({
  title,
  body,
  hour24,
  minute,
  dayIndexes,
}: ScheduleParams): Promise<string[]> {
  const granted = await ensureNotificationPermissions();

  if (!granted) return [];

  if (!dayIndexes || dayIndexes.length === 0) return [];

  // De-duplicate + validate to guard against ever double-scheduling the same weekday
  const uniqueDayIndexes = Array.from(new Set(dayIndexes)).filter((d) => d >= 0 && d <= 6);

  const ids: string[] = [];

  for (const dayIndex of uniqueDayIndexes) {
    const weekday = dayIndex + 1; // expo-notifications: Sunday = 1 ... Saturday = 7

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour: hour24,
        minute,
        repeats: true,
      },
    });

    ids.push(id);
  }

  return ids;
}

export async function scheduleIntervalReminder({
  title,
  body,
  intervalMinutes,
}: {
  title: string;
  body: string;
  intervalMinutes: number;
}): Promise<string[]> {
  const granted = await ensureNotificationPermissions();

  if (!granted) return [];

  if (!intervalMinutes || intervalMinutes <= 0) return [];

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });

  return [id];
}

export async function cancelReminderNotifications(ids: string[]): Promise<void> {
  if (!ids?.length) return;

  await Promise.allSettled(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function scheduleExpiryReminders(renewsAt: Date, planName: string): Promise<string[]> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return [];

  const ids: string[] = [];
  const offsets = [
    { daysBefore: 3, body: `Your ${planName} plan expires in 3 days. Renew to keep your benefits.` },
    { daysBefore: 0, body: `Your ${planName} plan expires today. Renew now to avoid interruption.` },
  ];

  for (const offset of offsets) {
    const fireDate = new Date(renewsAt.getTime() - offset.daysBefore * 24 * 60 * 60 * 1000);
    if (fireDate.getTime() <= Date.now()) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title: 'Subscription Reminder', body: offset.body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
    });
    ids.push(id);
  }

  return ids;
}

/**
 * Schedules a single one-off notification after N seconds -- used for
 * things like a workout timer ("10 min treadmill done!").
 */
export async function scheduleOneOffNotification({
  title,
  body,
  seconds,
}: {
  title: string;
  body: string;
  seconds: number;
}): Promise<string | null> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
      repeats: false,
    },
  });

  return id;
}

/**
 * Cancel every scheduled reminder in the app.
 */
export async function cancelAllReminderNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Returns all scheduled notifications.
 */
export async function getScheduledReminderNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Reschedule all reminders after login/app restart.
 */
export async function rescheduleReminderNotifications(
  reminders: {
    title: string;
    time: string;
    days: string[];
    type: 'water' | 'exercise';
  }[]
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};

  for (const reminder of reminders) {
    if (reminder.type === 'water') {
      const minutes = parseIntervalLabel(reminder.time);

      if (!minutes) continue;

      result[reminder.title] = await scheduleIntervalReminder({
        title: reminder.title,
        body: 'Time to drink water! 💧',
        intervalMinutes: minutes,
      });

      continue;
    }

    const { hour24, minute } = parseTimeString(reminder.time);

    const dayIndexes = parseDaysToIndexes(reminder.days);

    result[reminder.title] = await scheduleReminderNotifications({
      title: reminder.title,
      body: `Time for: ${reminder.title} 🏋️`,
      hour24,
      minute,
      dayIndexes,
    });
  }

  return result;
}

/**
 * Cancel everything before logout.
 */
export async function clearNotificationsOnLogout(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.log('Logout notification cleanup:', e);
  }
}

/**
 * Cancel everything before deleting account.
 */
export async function clearNotificationsOnDeleteAccount(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.log('Delete notification cleanup:', e);
  }
}

/**
 * Prevent duplicate notifications after app restart: wipes every OS-scheduled
 * notification first, then reschedules fresh ones from the reminders passed in.
 * Callers must persist the returned ids back into Supabase (`notification_ids`)
 * so the two stay in sync.
 */
export async function clearAndReschedule(
  reminders: {
    title: string;
    time: string;
    days: string[];
    type: 'water' | 'exercise';
  }[]
): Promise<Record<string, string[]>> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  return await rescheduleReminderNotifications(reminders);
}
