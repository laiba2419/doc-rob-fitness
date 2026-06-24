import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ContinuePhone() {
  const { theme } = useTheme();
  const router = useRouter();
  const [phone, setPhone] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Continue with phone</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        You'll receive 6 digit code to verify next.
      </Text>

      <InputField label="Phone Number" placeholder="+92 300 1234567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <PrimaryButton title="Continue" onPress={() => router.push('/auth/verify-otp')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
});
