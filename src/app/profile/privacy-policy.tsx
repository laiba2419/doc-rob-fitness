import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sections = [
  {
    heading: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email, age, height, and weight, to personalize your fitness experience. We also collect usage data to improve app performance.',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'Your information is used to generate personalized workout and nutrition plans, track your progress, and send you reminders you have set within the app.',
  },
  {
    heading: '3. Data Storage',
    body: 'Your data is stored securely on your device and, where applicable, on our servers using industry-standard encryption practices.',
  },
  {
    heading: '4. Third-Party Sharing',
    body: 'We do not sell your personal information. Limited data may be shared with service providers solely to operate core app features.',
  },
  {
    heading: '5. Your Rights',
    body: 'You may access, update, or delete your account information at any time from the Settings menu.',
  },
];

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text>
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
