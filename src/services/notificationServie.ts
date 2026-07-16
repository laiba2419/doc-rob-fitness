import { supabase } from '@/lib/supabase';

export type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  is_read: boolean;
  created_at: string;
};

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

// Fetch all notifications for the logged-in user, newest first
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_notifications')
    .select('id, icon, title, subtitle, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchNotifications error:', error);
    return [];
  }
  return data ?? [];
}

// Create a new notification row for the logged-in user.
// Called from other services (e.g. homeService) whenever an action
// should notify the user -- like scheduling a workout.
export async function createNotification(
  title: string,
  subtitle: string,
  icon: string = 'fitness-outline'
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('user_notifications')
    .insert({ user_id: userId, title, subtitle, icon });

  if (error) {
    console.error('createNotification error:', error);
    return false;
  }
  return true;
}

// Mark a single notification as read (useful if you later add tap-to-read behavior)
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('markNotificationAsRead error:', error);
    return false;
  }
  return true;
}

// Mark all of the logged-in user's notifications as read
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('user_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('markAllNotificationsAsRead error:', error);
    return false;
  }
  return true;
}

// Delete a single notification
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('deleteNotification error:', error);
    return false;
  }
  return true;
}
