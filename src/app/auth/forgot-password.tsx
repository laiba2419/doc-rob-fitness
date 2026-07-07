import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const { sendPasswordResetOtp, testRawPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordResetOtp(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Failed to Send Code', error);
      return;
    }

    router.push({ pathname: '/auth/verify-reset-otp', params: { email: email.trim() } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Forgot password</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Please enter your email address to request a password reset
      </Text>

      <InputField label="Email" placeholder="your_email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 8 }} />
      ) : (
        <PrimaryButton title="Continue" onPress={handleContinue} />
      )}

      {/* TEMPORARY DEBUG BUTTON — remove after diagnosing the reset-password 500 error */}
      <PrimaryButton
        title="TEST Raw Reset"
        onPress={() => testRawPasswordReset(email.trim())}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
});