import BackHeader from '@/components/BackHeader';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { resetPasswordWithOtp } = useAuth();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !otp) {
      Alert.alert(t('auth.verifyEmail.errorTitle'), t('auth.verifyEmail.emailMissingMsg'));
      return;
    }

    if (!newPass || !confirm) {
      Alert.alert(t('auth.common.missingFieldsTitle'), t('auth.resetPassword.missingFieldsMsg'));
      return;
    }
    if (newPass.length < 6) {
      Alert.alert(t('auth.signup.weakPasswordTitle'), t('auth.resetPassword.weakPasswordMsg'));
      return;
    }
    if (newPass !== confirm) {
      Alert.alert(t('auth.resetPassword.passwordsMismatchTitle'), t('auth.resetPassword.passwordsMismatchMsg'));
      return;
    }

    setLoading(true);
    const { error } = await resetPasswordWithOtp(email, otp, newPass);
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.resetPassword.resetFailedTitle'), error);
      return;
    }

    Alert.alert(t('auth.resetPassword.passwordResetTitle'), t('auth.resetPassword.passwordResetMsg'), [
      { text: t('auth.common.ok'), onPress: () => router.replace('/auth/login') },
    ]);
  };

  const renderField = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    show: boolean,
    setShow: (v: boolean) => void
  ) => (
    <>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={setValue}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={theme.placeholder}
        />
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('auth.resetPassword.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('auth.resetPassword.subtitle')}
      </Text>

      {renderField(t('auth.resetPassword.newPasswordLabel'), newPass, setNewPass, showNew, setShowNew)}
      {renderField(t('auth.resetPassword.confirmNewPasswordLabel'), confirm, setConfirm, showConfirm, setShowConfirm)}

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 8 }} />
      ) : (
        <TouchableOpacity style={[styles.updateBtn, { backgroundColor: theme.primary }]} onPress={handleReset}>
          <Text style={styles.updateBtnText}>{t('auth.resetPassword.resetButton')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, marginBottom: 16,
  },
  input: { flex: 1, fontSize: 14 },
  updateBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  updateBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});