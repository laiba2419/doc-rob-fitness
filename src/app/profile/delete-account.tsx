import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DeleteAccountScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [password, setPassword] = useState('');

  const handleDelete = () => {
    if (!password) {
      Alert.alert('Password Required', 'Please enter your password to confirm.');
      return;
    }
    Alert.alert(
      'Delete Account?',
      'This action is permanent and cannot be undone. All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => router.replace('/auth/login' as any),
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Delete Account</Text>

      <View style={[styles.warningCard, { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name="warning-outline" size={22} color="#EF4444" />
        <Text style={styles.warningText}>
          Deleting your account will permanently remove all your data, including your workout history,
          progress, and saved preferences. This cannot be undone.
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Enter Password to Confirm</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor={theme.placeholder}
      />

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Delete My Account</Text>
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
    height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  deleteBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
