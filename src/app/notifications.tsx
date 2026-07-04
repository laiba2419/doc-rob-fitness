import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  time: string;
};

// Yeh list khali kar dein ([]) taake empty state dekh sakein
const notifications: NotificationItem[] = [
  { id: '1', icon: 'barbell-outline', title: 'New Exercise', subtitle: 'A new exercise has been added to your plan', time: 'Today' },
  { id: '2', icon: 'pricetag-outline', title: 'Special Offers', subtitle: 'Get 30% off on premium plan this week', time: 'Today' },
  { id: '3', icon: 'nutrition-outline', title: 'Nutrition Tips', subtitle: 'Check out healthy meal ideas for recovery', time: 'Yesterday' },
  { id: '4', icon: 'star-outline', title: 'Subscription Alert', subtitle: 'Your subscription renews in 3 days', time: '2 days ago' },
];

export default function NotificationsScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          {/* Note: yahan real illustration lagani hai, abhi placeholder icon hai */}
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.surface }]}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textSecondary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            You Haven't Any Notification
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <View key={item.id} style={[styles.row, { backgroundColor: theme.surface }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
                <Ionicons name={item.icon} size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.rowTime, { color: theme.textSecondary }]}>{item.time}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
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
