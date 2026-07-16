import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

const OTP_VALID_SECONDS = 10 * 60; // 10 minutes — must match the Edge Function's expiry
const RESEND_COOLDOWN_SECONDS = 60; // prevent rapid re-sends that trigger Gmail rate limiting

export default function VerifyResetOTP() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { verifyPasswordResetOtp, sendPasswordResetOtp } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_VALID_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  // Countdown timer (OTP expiry)
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft > 0]);

  // Countdown timer (resend cooldown)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown > 0]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isExpired = secondsLeft <= 0;

  const handleChange = (text: string, index: number) => {
    // Handles autofill: if the OS pastes the full code into one box, split it across all boxes
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = ['', '', '', '', '', ''];
      digits.forEach((d, i) => { newOtp[i] = d; });
      setOtp(newOtp);
      const lastIndex = Math.min(digits.length, 5);
      inputsRef.current[lastIndex]?.focus();
      return;
    }

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
      Alert.alert(t('auth.verifyEmail.incompleteCodeTitle'), t('auth.verifyEmail.incompleteCodeMsg'));
      return;
    }
    if (!email) {
      Alert.alert(t('auth.verifyEmail.errorTitle'), t('auth.verifyEmail.emailMissingMsg'));
      return;
    }
    if (isExpired) {
      Alert.alert(t('auth.verifyEmail.errorTitle'), 'This code has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    const { error } = await verifyPasswordResetOtp(email, code);
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.verifyEmail.verificationFailedTitle'), error);
      return;
    }

    router.push({ pathname: '/auth/reset-password', params: { email, otp: code } });
  };

  const handleResend = async () => {
    if (!email) return;

    if (resendCooldown > 0) {
      Alert.alert('Please wait', `You can request a new code in ${resendCooldown} seconds.`);
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordResetOtp(email);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.verifyEmail.failedToResendTitle'), error);
    } else {
      setOtp(['', '', '', '', '', '']);
      setSecondsLeft(OTP_VALID_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert(
        'Code Sent',
        'A new code is on its way to your email. It usually arrives within a minute, but may take a few minutes.'
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('auth.verifyResetOtp.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('auth.verifyResetOtp.subtitle')}
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
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
          />
        ))}
      </View>

      <Text style={{ color: isExpired ? '#E53935' : theme.textSecondary, textAlign: 'center', marginBottom: 16, fontWeight: '600' }}>
        {isExpired ? 'Code expired' : `Code expires in ${formatTime(secondsLeft)}`}
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginBottom: 16 }} />
      ) : (
        <PrimaryButton title={t('auth.verifyEmail.verifyButton')} onPress={handleVerify} />
      )}

      <Text
        style={{
          color: resendCooldown > 0 ? theme.textSecondary : theme.primary,
          textAlign: 'center',
          marginTop: 16,
          fontWeight: '600',
        }}
        onPress={handleResend}
      >
        {resendCooldown > 0 ? `${t('auth.verifyEmail.resendCode')} (${resendCooldown}s)` : t('auth.verifyEmail.resendCode')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  otpBox: { width: 44, height: 52, borderWidth: 1, borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '600' },
});