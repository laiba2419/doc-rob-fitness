import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import StepProgressBar from '@/components/StepProgressBar';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InputGender() {
  const { theme } = useTheme();
  const router = useRouter();
  const { updateProfile } = useUserProfile();
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  const handleNext = async () => {
    if (!selected) return;
    await updateProfile({ gender: selected === 'male' ? 'Male' : 'Female' });
    router.push('/setup/age');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <StepProgressBar totalSteps={4} currentStep={2} />
      <Text style={[styles.title, { color: theme.text }]}>What's Your Gender?</Text>

      <View style={styles.row}>
        {(['male', 'female'] as const).map((gender) => {
          const isSelected = selected === gender;
          const isDimmed = selected !== null && !isSelected;
          const imgSource =
            gender === 'male'
              ? require('../../../assets/images/male.png')
              : require('../../../assets/images/female.png');

          return (
            <TouchableOpacity
              key={gender}
              style={styles.cardWrapper}
              onPress={() => setSelected(gender)}
              activeOpacity={0.85}
            >
              {/* Card background */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected ? theme.primary : '#FFFFFF',
                    borderColor: isSelected ? theme.primary : '#E2E2E2',
                    borderWidth: isSelected ? 0 : 1.5,
                  },
                ]}
              />

              {/* Image — grayscale jab doosra select ho, koi opacity drop nahi */}
              <Image
                source={imgSource}
                style={[
                  styles.image,
                  // @ts-ignore - RN's CSS-style filter, no native lib needed
                  isDimmed && { filter: [{ grayscale: 1 }] },
                ]}
                resizeMode="contain"
              />

              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? theme.text : '#9E9E9E',
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {gender === 'male' ? 'Male' : 'Female'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <PrimaryButton
        title="Next"
        disabled={!selected}
        onPress={handleNext}
        style={{ marginTop: 'auto', marginBottom: 20 }}
      />
    </View>
  );
}

const CARD_HEIGHT = 220;
const IMG_HEIGHT = 310;
const WRAPPER_HEIGHT = IMG_HEIGHT + 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },

  row: {
    flexDirection: 'row',
    gap: 16,
  },

  cardWrapper: {
    flex: 1,
    height: WRAPPER_HEIGHT,
    alignItems: 'center',
  },

  card: {
    position: 'absolute',
    top: (WRAPPER_HEIGHT - CARD_HEIGHT) / 2 - 10,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    borderRadius: 16,
  },

  image: {
    position: 'absolute',
    top: 0,
    width: '170%',
    height: 320,
    zIndex: 2,
  },

  label: {
    position: 'absolute',
    bottom: 6,
    fontSize: 15,
    zIndex: 3,
  },
});