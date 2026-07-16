import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { fetchNotifications, NotificationItem } from '@/services/notificationServie';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Moved inside the component so it can use t() -- "Today"/"Yesterday"/
  // "{{count}} days ago" now come from the active language's translation.
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('common.today');
    if (diffDays === 1) return t('common.yesterday');
    return t('common.daysAgo', { count: diffDays });
  };

  useEffect(() => {
    (async () => {
      const data = await fetchNotifications();
      setNotifications(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('common.notifications')}</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.surface }]}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textSecondary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('common.noNotifications')}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <View key={item.id} style={[styles.row, { backgroundColor: theme.surface }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
                <Ionicons name={item.icon as any} size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.rowTime, { color: theme.textSecondary }]}>
                {formatTimeAgo(item.created_at)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingBottom: 100 },
  emptyIconWrap: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  rowSubtitle: { fontSize: 12, lineHeight: 17 },
  rowTime: { fontSize: 11 },
});
