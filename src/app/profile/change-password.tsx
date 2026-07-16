import BackHeader from '@/components/BackHeader';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!newPass || !confirm) {
      Alert.alert(t('profile.changePassword.missingFieldsTitle'), t('profile.changePassword.missingFieldsMessage'));
      return;
    }
    if (newPass !== confirm) {
      Alert.alert(t('profile.changePassword.mismatchTitle'), t('profile.changePassword.mismatchMessage'));
      return;
    }
    if (newPass.length < 6) {
      Alert.alert(t('profile.changePassword.missingFieldsTitle'), t('profile.changePassword.weakPasswordMessage'));
      return;
    }

    setLoading(true);

    // User already has an active session (logged in) — no need to re-verify old password
    const { error } = await supabase.auth.updateUser({ password: newPass });

    setLoading(false);

    if (error) {
      Alert.alert(t('profile.common.error'), error.message);
      return;
    }

    Alert.alert(t('profile.changePassword.updatedTitle'), t('profile.changePassword.updatedMessage'), [
      { text: 'OK', onPress: () => router.back() },
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
          editable={!loading}
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
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.changePassword.title')}</Text>

      {renderField(t('profile.changePassword.newPassword'), newPass, setNewPass, showNew, setShowNew)}
      {renderField(t('profile.changePassword.confirmNewPassword'), confirm, setConfirm, showConfirm, setShowConfirm)}

      <TouchableOpacity
        style={[styles.updateBtn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.updateBtnText}>{t('profile.changePassword.updatePassword')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, marginBottom: 16,
  },
  input: { flex: 1, fontSize: 14 },
  updateBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  updateBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});