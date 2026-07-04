import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubscriptionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [hasSubscription] = useState(false);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Subscription</Text>

      {hasSubscription ? (
        <View style={[styles.activeCard, { backgroundColor: theme.primary }]}>
          <Ionicons name="star" size={28} color="#FFFFFF" />
          <Text style={styles.activePlan}>Yearly Plan</Text>
          <Text style={styles.activeSub}>Renews on July 18, 2026</Text>
          <TouchableOpacity style={styles.manageBtn} onPress={() => router.push('/profile/subscription-plans' as any)}>
            <Text style={[styles.manageBtnText, { color: theme.primary }]}>Manage Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
            <Ionicons name="star-outline" size={42} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Active Subscription</Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            Unlock personalized plans, full workout library, and premium features.
          </Text>
          <TouchableOpacity
            style={[styles.upgradeBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/profile/subscription-plans' as any)}
          >
            <Text style={styles.upgradeBtnText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  iconWrap: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24, marginBottom: 24 },
  upgradeBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  upgradeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  activeCard: { borderRadius: 20, padding: 24, alignItems: 'center' },
  activePlan: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 10 },
  activeSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, marginBottom: 18 },
  manageBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  manageBtnText: { fontSize: 14, fontWeight: '700' },
});
