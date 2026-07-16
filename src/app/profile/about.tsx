import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AboutItem = {
  id: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const items: AboutItem[] = [
  { id: 'privacy', labelKey: 'profile.about.privacyPolicy', icon: 'shield-checkmark-outline', route: '/profile/privacy-policy' },
  { id: 'terms', labelKey: 'profile.about.termsConditions', icon: 'document-text-outline', route: '/profile/terms' },
  { id: 'about-us', labelKey: 'profile.about.aboutUs', icon: 'people-outline', route: '/profile/about-us' },
];

export default function AboutScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.about.title')}</Text>

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
            <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name={item.icon} size={18} color={theme.primary} />
            </View>
            <Text style={[styles.label, { color: theme.text }]}>{t(item.labelKey)}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.version, { color: theme.textSecondary }]}>{t('profile.about.version')}</Text>
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
  version: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});