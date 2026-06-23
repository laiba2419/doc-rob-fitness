import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';

export default function SplashScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding/screen');
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoWrap}>
        <View style={[styles.logoCircle, { borderColor: theme.primary }]}>
          <Ionicons name="fitness" size={40} color={theme.primary} />
        </View>
        <Text style={[styles.brand, { color: theme.primary }]}>FITNESS</Text>
        <Text style={[styles.title, { color: theme.text }]}>GetFit</Text>
      </View>
      <Text style={[styles.footer, { color: theme.textSecondary }]}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoWrap: { alignItems: 'center' },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brand: { fontSize: 13, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700' },
  footer: { position: 'absolute', bottom: 40, fontSize: 12 },
});
