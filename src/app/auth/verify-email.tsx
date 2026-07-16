import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

export default function VerifyEmailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { verifySignupOtp, resendSignupOtp } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
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
      Alert.alert(t('auth.verifyEmail.incompleteCodeTitle'), t('auth.verifyEmail.incompleteCodeMsg'));
      return;
    }
    if (!email) {
      Alert.alert(t('auth.verifyEmail.errorTitle'), t('auth.verifyEmail.emailMissingMsg'));
      return;
    }

    setLoading(true);
    const { error } = await verifySignupOtp(email, code);
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.verifyEmail.verificationFailedTitle'), error);
      return;
    }

    router.replace('/setup/details');
  };

  const handleResend = async () => {
    if (!email) return;
    const { error } = await resendSignupOtp(email);
    if (error) {
      Alert.alert(t('auth.verifyEmail.failedToResendTitle'), error);
    } else {
      Alert.alert(t('auth.verifyEmail.codeSentTitle'), t('auth.verifyEmail.codeSentMsg'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('auth.verifyEmail.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('auth.verifyEmail.subtitle')}
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
        <PrimaryButton title={t('auth.verifyEmail.verifyButton')} onPress={handleVerify} />
      )}

      <Text style={{ color: theme.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' }} onPress={handleResend}>
        {t('auth.verifyEmail.resendCode')}
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
