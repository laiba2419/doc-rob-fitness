import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import StepProgressBar from '@/components/StepProgressBar';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeType } from '@/theme/colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function UnitToggle({
  options,
  selected,
  onSelect,
  theme,
}: {
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  theme: ThemeType;
}) {
  return (
    <View style={[styles.toggleWrap, { backgroundColor: theme.border }]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          style={[styles.toggleBtn, { backgroundColor: selected === opt ? theme.primary : 'transparent' }]}
        >
          <Text style={{ color: selected === opt ? '#FFFFFF' : theme.text, fontSize: 12, fontWeight: '600' }}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Conversion helpers so we always persist height in cm and weight in kg,
// regardless of which unit the user picked on this screen.
function toCm(value: number, unit: string): number {
  return unit === 'ft' ? Math.round(value * 30.48) : Math.round(value);
}

function toKg(value: number, unit: string): number {
  return unit === 'lb' ? Math.round(value * 0.453592 * 10) / 10 : value;
}

export default function InputHeightWeight() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { updateProfile } = useUserProfile();
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('65.4');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');

  const handleDone = async () => {
    const heightNum = parseFloat(height) || 0;
    const weightNum = parseFloat(weight) || 0;

    await updateProfile({
      height: toCm(heightNum, heightUnit),
      heightUnit: heightUnit as 'cm' | 'ft',
      weight: toKg(weightNum, weightUnit),
      weightUnit: weightUnit as 'kg' | 'lb',
    });

    router.replace('/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <StepProgressBar totalSteps={4} currentStep={4} />

      <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.heightWeightTitle')}</Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('profile.editProfile.height')}</Text>
      <View style={[styles.row, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <TextInput style={[styles.input, { color: theme.text }]} value={height} onChangeText={setHeight} keyboardType="numeric" />
        <UnitToggle options={['cm', 'ft']} selected={heightUnit} onSelect={setHeightUnit} theme={theme} />
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('profile.editProfile.weight')}</Text>
      <View style={[styles.row, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <TextInput style={[styles.input, { color: theme.text }]} value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <UnitToggle options={['kg', 'lb']} selected={weightUnit} onSelect={setWeightUnit} theme={theme} />
      </View>

      <PrimaryButton title={t('onboarding.done')} onPress={handleDone} style={{ marginTop: 'auto', marginBottom: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52, marginBottom: 20, justifyContent: 'space-between' },
  input: { fontSize: 16, fontWeight: '600', flex: 1 },
  toggleWrap: { flexDirection: 'row', borderRadius: 8, padding: 3 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
});
