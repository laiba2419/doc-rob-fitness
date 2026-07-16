import BackHeader from '@/components/BackHeader';
import { supabase } from '@/lib/supabase';
import { cancelReminderNotifications } from '@/lib/notifications';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DeleteAccountScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { clearProfile } = useUserProfile();
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const performDelete = async () => {
    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setDeleting(false);
      Alert.alert(t('profile.common.error'), t('profile.deleteAccount.accountNotFound'));
      return;
    }

    // ✅ Actually verify the password by attempting to sign in with it --
    // this was completely missing before (any non-empty text "worked").
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInError) {
      setDeleting(false);
      Alert.alert(t('profile.deleteAccount.incorrectPasswordTitle'), t('profile.deleteAccount.incorrectPasswordMessage'));
      return;
    }

    // ✅ Cancel every locally-scheduled device notification for this user's
    // reminders BEFORE deleting anything. The Edge Function runs on
    // Supabase's servers and has no way to touch this device's OS-level
    // scheduled notifications -- only the app itself (running on this
    // device) can cancel them. Without this step, old reminders kept
    // firing even after the account (and its DB row) was gone.
    const { data: existingReminders } = await supabase
      .from('reminders')
      .select('notification_ids')
      .eq('user_id', user.id);

    const allNotificationIds = (existingReminders ?? []).flatMap(
      (r) => r.notification_ids ?? []
    );
    if (allNotificationIds.length > 0) {
      await cancelReminderNotifications(allNotificationIds);
    }

    // ✅ Actually deletes the account + all their data via a secure server-side
    // Edge Function (the client can't delete an auth user or bypass RLS itself).
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const { error: fnError } = await supabase.functions.invoke('delete-account', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setDeleting(false);

    if (fnError) {
      Alert.alert(t('profile.common.error'), t('profile.deleteAccount.couldNotDelete', { message: fnError.message }));
      return;
    }

    // Session is already invalidated server-side, but sign out locally too
    // so no stale token is left on the device.
    await supabase.auth.signOut();

    // ✅ Also wipe the cached local profile -- without this, the next
    // account created on this device would still show this deleted
    // account's name/email/photo.
    await clearProfile();

    Alert.alert(t('profile.deleteAccount.deletedTitle'), t('profile.deleteAccount.deletedMessage'), [
      { text: 'OK', onPress: () => router.replace('/auth/login' as any) },
    ]);
  };

  const handleDelete = () => {
    if (!password) {
      Alert.alert(t('profile.deleteAccount.passwordRequiredTitle'), t('profile.deleteAccount.passwordRequiredMessage'));
      return;
    }
    Alert.alert(
      t('profile.deleteAccount.confirmTitle'),
      t('profile.deleteAccount.confirmMessage'),
      [
        { text: t('profile.common.cancel'), style: 'cancel' },
        { text: t('profile.common.delete'), style: 'destructive', onPress: performDelete },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.deleteAccount.title')}</Text>

      <View style={[styles.warningCard, { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name="warning-outline" size={22} color="#EF4444" />
        <Text style={styles.warningText}>
          {t('profile.deleteAccount.warning')}
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>{t('profile.deleteAccount.passwordLabel')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor={theme.placeholder}
        editable={!deleting}
      />

      <TouchableOpacity
        style={[styles.deleteBtn, { opacity: deleting ? 0.7 : 1 }]}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.deleteBtnText}>{t('profile.deleteAccount.deleteMyAccount')}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  warningCard: { flexDirection: 'row', gap: 12, borderRadius: 14, padding: 16, marginBottom: 24 },
  warningText: { flex: 1, color: '#991B1B', fontSize: 13, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, marginBottom: 24 },
  deleteBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  deleteBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});