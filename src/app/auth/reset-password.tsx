import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    if (!newPass || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in both password fields.');
      return;
    }
    if (newPass !== confirm) {
      Alert.alert('Passwords Do Not Match', 'New password and confirmation must match.');
      return;
    }
    Alert.alert('Password Reset', 'Your password has been reset successfully.', [
      { text: 'OK', onPress: () => router.replace('/auth/login') },
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
      <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Create a new password for your account
      </Text>

      {renderField('New Password', newPass, setNewPass, showNew, setShowNew)}
      {renderField('Confirm New Password', confirm, setConfirm, showConfirm, setShowConfirm)}

      <TouchableOpacity style={[styles.updateBtn, { backgroundColor: theme.primary }]} onPress={handleReset}>
        <Text style={styles.updateBtnText}>Reset Password</Text>
      </TouchableOpacity>
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