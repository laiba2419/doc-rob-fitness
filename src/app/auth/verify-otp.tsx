import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

export default function VerifyOTP() {
  const { theme } = useTheme();
  const router = useRouter();
  const { verifyPhoneOtp, sendPhoneOtp } = useAuth();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);

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
    if (code.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the full 6 digit code.');
      return;
    }
    if (!phone) {
      Alert.alert('Error', 'Phone number missing, please go back and try again.');
      return;
    }

    setLoading(true);
    const { error } = await verifyPhoneOtp(phone, code);
    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error);
      return;
    }

    router.push('/home');
  };

  const handleResend = async () => {
    if (!phone) return;
    const { error } = await sendPhoneOtp(phone);
    if (error) {
      Alert.alert('Failed to Resend', error);
    } else {
      Alert.alert('Code Sent', 'A new code has been sent to your phone.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>OTP Verification</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        OTP has been sent to your number, please enter the OTP to verify
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