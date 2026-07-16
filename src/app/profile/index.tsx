import BottomNav from '@/components/BottomNav';
import { useUserProfile } from '@/context/UserProfileContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearNotificationsOnLogout } from "@/lib/notifications";
type MenuItem = {
  id: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const menuItems: MenuItem[] = [
  { id: 'blog', labelKey: 'profile.menu.items.blog', icon: 'newspaper-outline', route: '/profile/blog' },
  { id: 'subscription', labelKey: 'profile.menu.items.subscription', icon: 'ribbon-outline', route: '/profile/subscription' },
  { id: 'preferred', labelKey: 'profile.menu.items.preferred', icon: 'heart-outline', route: '/profile/preferred-workouts' },
  { id: 'reminders', labelKey: 'profile.menu.items.reminders', icon: 'alarm-outline', route: '/profile/reminders' },
  { id: 'assigned', labelKey: 'profile.menu.items.assigned', icon: 'people-outline', route: '/profile/assigned-workout' },
  { id: 'settings', labelKey: 'profile.menu.items.settings', icon: 'settings-outline', route: '/profile/settings' },
  { id: 'about', labelKey: 'profile.menu.items.about', icon: 'information-circle-outline', route: '/profile/about' },
];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, setProfile, clearProfile } = useUserProfile();

  const handleLogout = () => {
    Alert.alert(t('profile.menu.logoutConfirmTitle'), t('profile.menu.logoutConfirmMessage'), [
      { text: t('profile.common.cancel'), style: 'cancel' },
      {
        text: t('profile.menu.items.logout'),
        style: 'destructive',
        onPress: async () => {
          // ✅ This was missing before -- the button only navigated to the
          // login screen without ever actually ending the Supabase session.
          await clearNotificationsOnLogout();
        try {
  await clearNotificationsOnLogout();
         } catch (e) {
         console.log("Notification cleanup failed", e);
         }

await supabase.auth.signOut();
          // ✅ Also clear the cached local profile, so if a different
          // account logs in on this device next, it won't inherit this
          // user's name/email/photo from AsyncStorage.
          await clearProfile();
          router.replace('/auth/login' as any);
        },
      },
    ]);
  };

  const handleRemovePhoto = () => {
    Alert.alert(t('profile.menu.removePhotoTitle'), t('profile.menu.removePhotoMessage'), [
      { text: t('profile.common.cancel'), style: 'cancel' },
      {
        text: t('profile.menu.removeAction'),
        style: 'destructive',
        onPress: () => setProfile({ ...profile, avatarUri: undefined }),
      },
    ]);
  };

  const goToEdit = () => router.push('/profile/EditProfileScreen' as any);

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : t('profile.menu.yourName');

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.blueBg, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>{t('profile.menu.screenTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={goToEdit}
          activeOpacity={0.85}
        >
          <View style={styles.topRow}>
            <View style={[styles.avatarWrap, { backgroundColor: theme.surface }]}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={36} color={theme.primary} />
              )}
            </View>

            <View style={styles.nameBlock}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{displayName}</Text>
              <Text style={[styles.emailText, { color: theme.textSecondary }]} numberOfLines={1}>
                {profile.email || t('profile.menu.yourEmail')}
              </Text>
              {profile.avatarUri ? (
                <TouchableOpacity onPress={handleRemovePhoto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.removePhoto}>{t('profile.menu.removePhoto')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {profile.weight ?? '--'}
                <Text style={[styles.statUnit, { color: theme.primary }]}> {profile.weightUnit ?? 'kg'}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.menu.weight')}</Text>
            </View>
            <View style={[styles.statBox]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {profile.height ?? '--'}
                <Text style={[styles.statUnit, { color: theme.primary }]}> {profile.heightUnit ?? 'cm'}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.menu.height')}</Text>
            </View>
            <View style={[styles.statBox]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {profile.age ?? '--'}
                <Text style={[styles.statUnit, { color: theme.primary }]}> {t('profile.menu.yearsShort')}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.menu.age')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index !== menuItems.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: theme.surface }]}>
                <Ionicons name={item.icon} size={18} color={theme.text} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{t(item.labelKey)}</Text>
              <Ionicons name="chevron-forward" size={17} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.menuRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="exit-outline" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.menuLabel, { color: '#EF4444' }]}>{t('profile.menu.items.logout')}</Text>
            <Ionicons name="chevron-forward" size={17} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  blueBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    paddingTop: 52,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 100,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  nameBlock: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  emailText: { fontSize: 12, marginTop: 3 },
  removePhoto: { fontSize: 11, color: '#EF4444', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: '#F0FAFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 15, fontWeight: '700' },
  statUnit: { fontSize: 11, fontWeight: '500' },
  statLabel: { fontSize: 11, marginTop: 3, opacity: 0.75 },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
});