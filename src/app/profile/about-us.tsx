import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutUsScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}>
        <View style={[styles.logoWrap, { backgroundColor: theme.primary }]}>
          <Ionicons name="fitness" size={42} color="#FFFFFF" />
        </View>
        <Text style={[styles.appName, { color: theme.text }]}>GetFit</Text>
        <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          GetFit is your all-in-one fitness companion — built to help you train smarter, eat better, and
          stay consistent. From personalized workout plans to nutrition tracking and daily reminders, GetFit
          keeps you motivated every step of the way.
        </Text>

        <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.text }]}>support@getfitapp.com</Text>
          </View>
          <View style={[styles.contactRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, marginTop: 12 }]}>
            <Ionicons name="globe-outline" size={18} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.text }]}>www.getfitapp.com</Text>
          </View>
        </View>

        <Text style={[styles.copyright, { color: theme.textSecondary }]}>© 2026 GetFit. All rights reserved.</Text>
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
