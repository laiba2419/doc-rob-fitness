import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import StepProgressBar from '@/components/StepProgressBar';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function InputDetails() {
  const { theme } = useTheme();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <BackHeader />
      <StepProgressBar totalSteps={4} currentStep={1} />

      <Text style={[styles.title, { color: theme.text }]}>Let us know about yourself</Text>

      <InputField label="First Name" placeholder="Enter first name" value={firstName} onChangeText={setFirstName} />
      <InputField label="Last Name" placeholder="Enter last name" value={lastName} onChangeText={setLastName} />
      <InputField label="Phone Number" placeholder="+92 300 1234567" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <InputField label="Email" placeholder="your_email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <InputField label="Password" placeholder="Create password" value={password} onChangeText={setPassword} secureTextEntry />
      <InputField label="Confirm Password" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <PrimaryButton title="Next" onPress={() => router.push('/setup/gender')} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, flexGrow: 1, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
});
