import BottomNav from '@/components/BottomNav';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  danger?: boolean;
};

const menuItems: MenuItem[] = [
  { id: 'blog', label: 'Blog', icon: 'newspaper-outline', route: '/profile/blog' },
  { id: 'subscription', label: 'Subscription', icon: 'star-outline', route: '/profile/subscription' },
  { id: 'preferred', label: 'Preferred Workouts & Nutrition', icon: 'barbell-outline', route: '/profile/preferred-workouts' },
  { id: 'reminders', label: 'Daily Reminder', icon: 'notifications-outline', route: '/profile/reminders' },
  { id: 'assigned', label: 'Assigned Workout & Diet', icon: 'clipboard-outline', route: '/profile/assigned-workout' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', route: '/profile/settings' },
  { id: 'about', label: 'About App', icon: 'information-circle-outline', route: '/profile/about' },
];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile } = useUserProfile();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/auth/login' as any) },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Profile</Text>

        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="person-circle" size={64} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>Your Name</Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>your@email.com</Text>
            </View>
            <TouchableOpacity
              style={[styles.editFab, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/profile/edit' as any)}
            >
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {profile.weight ? `${profile.weight}` : '--'}
                <Text style={styles.statUnit}> {profile.weightUnit}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Weight</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {profile.height ? `${profile.height}` : '--'}
                <Text style={styles.statUnit}> {profile.heightUnit}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Height</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{profile.age ?? '--'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Age</Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: theme.surface }]}>
                <Ionicons name={item.icon} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  name: { fontSize: 17, fontWeight: '700' },
  email: { fontSize: 13, marginTop: 2 },
  editFab: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, marginVertical: 2 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statUnit: { fontSize: 11, fontWeight: '500' },
  statLabel: { fontSize: 12, marginTop: 4 },
  menuCard: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, padding: 16, justifyContent: 'center' },
  logoutLabel: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
});
