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
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: selected === 'male' ? theme.primary : theme.surface, borderColor: selected === 'male' ? theme.primary : theme.border },
          ]}
          onPress={() => setSelected('male')}
        >
          <Image source={require('../../../assets/images/male.png')} style={styles.image} resizeMode="contain" />
          <Text style={{ color: selected === 'male' ? '#FFFFFF' : theme.text, fontWeight: '600', marginTop: 12 }}>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: selected === 'female' ? theme.primary : theme.surface, borderColor: selected === 'female' ? theme.primary : theme.border },
          ]}
          onPress={() => setSelected('female')}
        >
          <Image source={require('../../../assets/images/female.png')} style={styles.image} resizeMode="contain" />
          <Text style={{ color: selected === 'female' ? '#FFFFFF' : theme.text, fontWeight: '600', marginTop: 12 }}>Female</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton title="Next" disabled={!selected} onPress={() => router.push('/setup/age')} style={{ marginTop: 'auto', marginBottom: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  row: { flexDirection: 'row', gap: 16 },
  card: { flex: 1, aspectRatio: 0.85, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  image: { width: '70%', height: '70%' },
});
