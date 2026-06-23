import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NoInternetScreen({ onRetry }: { onRetry?: () => void }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Ionicons name="wifi-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.title, { color: theme.text }]}>No Internet</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Please check your connection and try again
      </Text>

      {onRetry && (
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
