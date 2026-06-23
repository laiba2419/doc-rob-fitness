import { useTheme } from '@/theme/ThemeContext';
import { StyleSheet, View } from 'react-native';

type Props = {
  totalSteps: number;
  currentStep: number;
};

export default function StepProgressBar({ totalSteps, currentStep }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            { backgroundColor: i < currentStep ? theme.primary : theme.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});
