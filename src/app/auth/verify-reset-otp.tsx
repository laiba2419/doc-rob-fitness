import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function VerifyResetOTP() {
  const { theme } = useTheme();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>OTP Verification</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        OTP has been sent to your email, please enter the OTP to verify
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

      <PrimaryButton title="Verify & Proceed" onPress={() => router.push('/auth/reset-password')} />
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