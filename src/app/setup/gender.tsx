import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import StepProgressBar from '@/components/StepProgressBar';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InputGender() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <StepProgressBar totalSteps={4} currentStep={2} />
      <Text style={[styles.title, { color: theme.text }]}>What's Your Gender?</Text>

      <View style={styles.row}>
        {(['male', 'female'] as const).map((gender) => {
          const isSelected = selected === gender;
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
              {/* Card — starts lower, image overflows from top */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              />

              {/* Image — anchored to top of wrapper, overflows card top */}
              <Image source={imgSource} style={styles.image} resizeMode="contain" />

              {/* Label inside card at bottom */}
              <Text style={[styles.label, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                {gender === 'male' ? 'Male' : 'Female'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <PrimaryButton
        title="Next"
        disabled={!selected}
        onPress={() => router.push('/setup/age')}
        style={{ marginTop: 'auto', marginBottom: 20 }}
      />
    </View>
  );
}

// Card height aur overflow amount
const OVERFLOW_TOP = 100;  // kitna upar se bahar nikle
const CARD_HEIGHT = 300;
const WRAPPER_HEIGHT = CARD_HEIGHT + OVERFLOW_TOP;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 16 },

  // Wrapper = card + overflow space upar
  cardWrapper: {
    flex: 1,
    height: WRAPPER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // Card occupies bottom portion of wrapper
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
  },

  // Image: top of wrapper se shuru, neeche tak
  // Sir upar overflow karta hai, feet card ke andar
  image: {
    position: 'absolute',
    top: 0,           // wrapper ke top se — card se upar nikle ga
    width: '100%',
    height: WRAPPER_HEIGHT - 30, // label ke liye thora space
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
    zIndex: 1,
  },
});