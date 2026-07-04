import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from './PrimaryButton';

type Props = {
  step: number;
  totalSteps: number;
  imageSource: ImageSourcePropType;
  title: string;
  nextRoute: string;
  isLast?: boolean;
};

export default function OnboardingTemplate({
  step,
  totalSteps,
  imageSource,
  title,
  nextRoute,
  isLast,
}: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.skip} onPress={() => router.push('/auth/login')}>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.imageWrap}>
        <View style={[styles.bgShape, { backgroundColor: theme.primary + '33' }]} />
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

        <View style={styles.dotsRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === step - 1 ? theme.primary : theme.border,
                  width: i === step - 1 ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>

        <PrimaryButton
          title={isLast ? "Let's Start" : 'Next'}
          onPress={() => router.push(nextRoute as any)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { alignSelf: 'flex-end', padding: 20 },
  imageWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bgShape: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 24,
    transform: [{ rotate: '20deg' }],
  },
  image: { width: 220, height: 320 },
  card: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 6, borderRadius: 3 },
});
