import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { sendPasswordResetOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert(t('auth.common.missingFieldsTitle'), t('auth.forgotPassword.missingFieldMsg'));
      return;
    }

    if (cooldown > 0) {
      Alert.alert(
        'Please wait',
        `A code was already sent. You can request another one in ${cooldown} seconds.`
      );
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordResetOtp(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.forgotPassword.failedToSendTitle'), error);
      return;
    }

    startCooldown();

    // Friendly heads-up: email delivery can take a few minutes, especially
    // for the first message a provider like Gmail sees from our domain.
    Alert.alert(
      'Code Sent',
      "We've sent a code to your email. It usually arrives within a minute, but it can take a few minutes — please check your inbox (and spam folder) before requesting a new one.",
      [
        {
          text: 'OK',
          onPress: () => router.push({ pathname: '/auth/verify-reset-otp', params: { email: email.trim() } }),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('auth.forgotPassword.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('auth.forgotPassword.subtitle')}
      </Text>

      <InputField
        label={t('auth.common.emailLabel')}
        placeholder={t('auth.common.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 8 }} />
      ) : (
        <PrimaryButton
          title={cooldown > 0 ? `${t('auth.common.continue')} (${cooldown}s)` : t('auth.common.continue')}
          onPress={handleContinue}
          disabled={cooldown > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
});