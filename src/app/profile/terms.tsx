import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sectionKeys = ['s1', 's2', 's3', 's4', 's5'];

export default function TermsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile.terms.title')}</Text>
        <Text style={[styles.updated, { color: theme.textSecondary }]}>{t('profile.terms.lastUpdated')}</Text>

        {sectionKeys.map((key) => (
          <View key={key} style={styles.section}>
            <Text style={[styles.heading, { color: theme.text }]}>{t(`profile.terms.${key}Heading`)}</Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>{t(`profile.terms.${key}Body`)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  updated: { fontSize: 12, marginTop: 4, marginBottom: 20 },
  section: { marginBottom: 18 },
  heading: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 13, lineHeight: 20 },
});