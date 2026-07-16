import BackHeader from '@/components/BackHeader';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import StepProgressBar from '@/components/StepProgressBar';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function InputDetails() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { updateProfile } = useUserProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = async () => {
    await updateProfile({ firstName, lastName, mobile: phoneNumber });
    router.push('/setup/gender');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <BackHeader />
      <StepProgressBar totalSteps={4} currentStep={1} />

      <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.detailsTitle')}</Text>

      <InputField
        label={t('profile.editProfile.firstName')}
        placeholder={t('profile.editProfile.firstNamePlaceholder')}
        value={firstName}
        onChangeText={setFirstName}
      />
      <InputField
        label={t('profile.editProfile.lastName')}
        placeholder={t('profile.editProfile.lastNamePlaceholder')}
        value={lastName}
        onChangeText={setLastName}
      />
      <InputField
        label={t('profile.editProfile.mobileNumber')}
        placeholder={t('profile.editProfile.mobilePlaceholder')}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <PrimaryButton title={t('onboarding.next')} onPress={handleNext} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, flexGrow: 1, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
});
