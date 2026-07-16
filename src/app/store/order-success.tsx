import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderSuccessScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
        <Ionicons name="checkmark" size={48} color="#FFFFFF" />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>{t('store.orderPlacedTitle')}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('store.orderPlacedSubtitle')}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.replace('/store' as any)}
      >
        <Text style={styles.buttonText}>{t('store.backToStore')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  button: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 40 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});