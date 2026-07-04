import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SettingsItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  danger?: boolean;
};

const items: SettingsItem[] = [
  { id: 'language', label: 'Choose Language', icon: 'language-outline', route: '/profile/language' },
  { id: 'theme', label: 'App Theme', icon: 'contrast-outline', route: '/profile/app-theme' },
  { id: 'password', label: 'Change Password', icon: 'lock-closed-outline', route: '/profile/change-password' },
  { id: 'delete', label: 'Delete Account', icon: 'trash-outline', route: '/profile/delete-account', danger: true },
];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.row,
              index !== items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.danger ? '#FEE2E2' : theme.surface }]}>
              <Ionicons name={item.icon} size={18} color={item.danger ? '#EF4444' : theme.primary} />
            </View>
            <Text style={[styles.label, { color: item.danger ? '#EF4444' : theme.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1, fontSize: 14, fontWeight: '500' },
});
