import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sections = [
  {
    heading: '1. Acceptance of Terms',
    body: 'By creating an account and using GetFit, you agree to be bound by these Terms & Conditions.',
  },
  {
    heading: '2. Use of the App',
    body: 'GetFit provides fitness tracking, workout plans, and nutrition guidance for personal use only. You agree not to misuse the app or its content.',
  },
  {
    heading: '3. Health Disclaimer',
    body: 'GetFit is not a substitute for professional medical advice. Consult a physician before beginning any new workout or diet program.',
  },
  {
    heading: '4. Subscriptions',
    body: 'Premium features require an active subscription. Subscriptions renew automatically unless cancelled before the renewal date.',
  },
  {
    heading: '5. Limitation of Liability',
    body: 'GetFit is provided "as is" without warranties of any kind. We are not liable for any injury or damages resulting from use of the app.',
  },
];

export default function TermsScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Terms & Conditions</Text>
        <Text style={[styles.updated, { color: theme.textSecondary }]}>Last updated: June 2026</Text>

        {sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text style={[styles.heading, { color: theme.text }]}>{s.heading}</Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>{s.body}</Text>
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
