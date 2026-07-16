import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useUserProfile } from '@/context/UserProfileContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function SignupScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { clearProfile, loadProfileForUser } = useUserProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert(t('auth.common.missingFieldsTitle'), t('auth.signup.missingFieldsMsg'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('auth.signup.weakPasswordTitle'), t('auth.signup.weakPasswordMsg'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('auth.signup.passwordsMismatchTitle'), t('auth.signup.passwordsMismatchMsg'));
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);

    if (error) {
      setLoading(false);
      Alert.alert(t('auth.signup.signupFailedTitle'), error);
      return;
    }

    // ✅ Brand new account -- wipe any stale cached profile from a previous
    // account on this device first, then load this user's (empty) profile
    // fresh from Supabase so the correct email shows and nothing old leaks
    // through (name, photo, etc.) into the new account.
    await clearProfile();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await loadProfileForUser(user.id);
    }

    setLoading(false);

    Alert.alert(t('auth.signup.accountCreatedTitle'), t('auth.signup.accountCreatedMsg'), [
      { text: t('auth.common.continue'), onPress: () => router.replace('/setup/details') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('auth.signup.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('auth.signup.subtitle')}
      </Text>

      <InputField
        label={t('auth.common.emailLabel')}
        placeholder={t('auth.common.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <InputField
        label={t('auth.common.passwordLabel')}
        placeholder={t('auth.common.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <InputField
        label={t('auth.signup.confirmPasswordLabel')}
        placeholder={t('auth.signup.confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 16 }} />
      ) : (
        <PrimaryButton title={t('auth.signup.signUpButton')} onPress={handleSignup} style={{ marginTop: 16 }} />
      )}

      <View style={styles.loginRow}>
        <Text style={{ color: theme.textSecondary }}>{t('auth.signup.alreadyHaveAccount')}</Text>
        <Text style={{ color: theme.primary, fontWeight: '600' }} onPress={() => router.push('/auth/login')}>
          {t('auth.signup.loginLink')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});
