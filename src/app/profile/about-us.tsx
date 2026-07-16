import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutUsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}>
        <View style={[styles.logoWrap, { backgroundColor: theme.primary }]}>
          <Ionicons name="fitness" size={42} color="#FFFFFF" />
        </View>
        <Text style={[styles.appName, { color: theme.text }]}>{t('profile.aboutUs.appName')}</Text>
        <Text style={[styles.version, { color: theme.textSecondary }]}>{t('profile.aboutUs.version')}</Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {t('profile.aboutUs.description')}
        </Text>

        <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.text }]}>{t('profile.aboutUs.email')}</Text>
          </View>
          <View style={[styles.contactRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, marginTop: 12 }]}>
            <Ionicons name="globe-outline" size={18} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.text }]}>{t('profile.aboutUs.website')}</Text>
          </View>
        </View>

        <Text style={[styles.copyright, { color: theme.textSecondary }]}>{t('profile.aboutUs.copyright')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  logoWrap: { width: 84, height: 84, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  appName: { fontSize: 22, fontWeight: '800' },
  version: { fontSize: 12, marginTop: 2, marginBottom: 20 },
  description: { fontSize: 13, lineHeight: 21, textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },
  contactCard: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 24 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontSize: 13, fontWeight: '500' },
  copyright: { fontSize: 11, marginTop: 8 },
});