import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/authcontext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function SignupScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please make sure both passwords match.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error);
      return;
    }

    Alert.alert('Account Created', 'Your account has been created successfully!', [
      { text: 'Continue', onPress: () => router.replace('/setup/details') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Sign up to get started with GetFit
      </Text>

      <InputField
        label="Email"
        placeholder="your_email@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <InputField
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <InputField
        label="Confirm Password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 16 }} />
      ) : (
        <PrimaryButton title="Sign Up" onPress={handleSignup} style={{ marginTop: 16 }} />
      )}

      <View style={styles.loginRow}>
        <Text style={{ color: theme.textSecondary }}>Already have an account? </Text>
        <Text style={{ color: theme.primary, fontWeight: '600' }} onPress={() => router.push('/auth/login')}>
          Login
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