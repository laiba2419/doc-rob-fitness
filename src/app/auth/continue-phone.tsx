import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function ContinuePhone() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { sendPhoneOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone.trim()) {
      Alert.alert(t('auth.continuePhone.missingFieldTitle'), t('auth.continuePhone.missingFieldMsg'));
      return;
    }

    setLoading(true);
    const { error } = await sendPhoneOtp(phone.trim());
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.continuePhone.failedToSendTitle'), error);
      return;
    }

    router.push({ pathname: '/auth/verify-otp', params: { phone: phone.trim() } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('auth.continuePhone.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('auth.continuePhone.subtitle')}
      </Text>

      <InputField
        label={t('auth.continuePhone.phoneLabel')}
        placeholder={t('auth.continuePhone.phonePlaceholder')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 8 }} />
      ) : (
        <PrimaryButton title={t('auth.common.continue')} onPress={handleContinue} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
});
