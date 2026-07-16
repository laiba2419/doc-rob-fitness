import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

export default function VerifyEmailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { verifySignupOtp, resendSignupOtp } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  console.log('[VerifyEmailScreen] mounted with email param:', email);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    console.log('[VerifyEmailScreen] handleVerify called. code =', code, 'email =', email);

    if (code.length < 6) {
      console.log('[VerifyEmailScreen] Code incomplete, aborting.');
      Alert.alert('Incomplete Code', 'Please enter the full 6 digit code.');
      return;
    }
    if (!email) {
      console.log('[VerifyEmailScreen] Email param missing, aborting.');
      Alert.alert('Error', 'Email missing, please go back and try again.');
      return;
    }

    setLoading(true);
    console.log('[VerifyEmailScreen] Calling verifySignupOtp...');
    const { error } = await verifySignupOtp(email, code);
    console.log('[VerifyEmailScreen] verifySignupOtp returned. error =', error);
    setLoading(false);

    if (error) {
      console.log('[VerifyEmailScreen] Verification failed:', error);
      Alert.alert('Verification Failed', error);
      return;
    }

    console.log('[VerifyEmailScreen] Verified successfully — navigating to /setup/details');
    router.replace('/setup/details');
  };

  const handleResend = async () => {
    console.log('[VerifyEmailScreen] handleResend called. email =', email);
    if (!email) {
      console.log('[VerifyEmailScreen] No email, aborting resend.');
      return;
    }
    const { error } = await resendSignupOtp(email);
    console.log('[VerifyEmailScreen] resendSignupOtp returned. error =', error);
    if (error) {
      Alert.alert('Failed to Resend', error);
    } else {
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Verify Your Email</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        A verification code has been sent to your email. Please enter it below.
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputsRef.current[index] = ref; }}
            style={[styles.otpBox, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginBottom: 16 }} />
      ) : (
        <PrimaryButton title="Verify & Proceed" onPress={handleVerify} />
      )}

      <Text style={{ color: theme.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' }} onPress={handleResend}>
        Resend Code
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpBox: { width: 44, height: 52, borderWidth: 1, borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '600' },
});