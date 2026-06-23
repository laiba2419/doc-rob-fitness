import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Forgot password</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Please enter your email address to request a password reset
      </Text>

      <InputField label="Email" placeholder="your_email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <PrimaryButton title="Continue" onPress={() => router.push('/auth/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
});
