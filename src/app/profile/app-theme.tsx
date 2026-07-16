import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ThemeOption = {
  id: 'light' | 'dark' | 'system';
  icon: keyof typeof Ionicons.glyphMap;
};

const options: ThemeOption[] = [
  { id: 'light', icon: 'sunny-outline' },
  { id: 'dark', icon: 'moon-outline' },
  { id: 'system', icon: 'phone-portrait-outline' },
];

export default function AppThemeScreen() {
  const { theme, themePreference, setThemePreference, activeMode } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.appTheme.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('profile.appTheme.subtitle', { mode: activeMode === 'dark' ? t('profile.appTheme.dark') : t('profile.appTheme.light') })}
      </Text>

      <View style={{ gap: 12 }}>
        {options.map((opt) => {
          const active = themePreference === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.row,
                { backgroundColor: theme.card, borderColor: active ? theme.primary : theme.border },
              ]}
              onPress={() => setThemePreference(opt.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
                <Ionicons name={opt.icon} size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>{t(`profile.appTheme.options.${opt.id}.label`)}</Text>
                <Text style={[styles.desc, { color: theme.textSecondary }]}>{t(`profile.appTheme.options.${opt.id}.description`)}</Text>
              </View>
              <Ionicons
                name={active ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={active ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 20, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, borderWidth: 1.5, padding: 16 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 12, marginTop: 2 },
});