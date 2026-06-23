import BackHeader from '@/components/BackHeader';
import { subscriptionPlans } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubscriptionPlansScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState('yearly');

  const handleChoose = () => {
    router.push({ pathname: '/profile/payment', params: { planId: selected } } as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Choose a Plan</Text>

      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {subscriptionPlans.map((plan) => {
          const active = selected === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.card,
                {
                  backgroundColor: active ? theme.primary : theme.card,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => setSelected(plan.id)}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.planName, { color: active ? '#FFFFFF' : theme.text }]}>{plan.name}</Text>
                  <Text style={[styles.planPrice, { color: active ? '#FFFFFF' : theme.text }]}>
                    {plan.price}
                    <Text style={styles.planPeriod}> {plan.period}</Text>
                  </Text>
                </View>
                {plan.highlighted && !active && (
                  <View style={[styles.badge, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>BEST VALUE</Text>
                  </View>
                )}
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={active ? '#FFFFFF' : theme.textSecondary}
                />
              </View>
              <View style={styles.featuresList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={14} color={active ? '#FFFFFF' : theme.primary} />
                    <Text style={[styles.featureText, { color: active ? 'rgba(255,255,255,0.9)' : theme.textSecondary }]}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={[styles.continueBtn, { backgroundColor: theme.primary }]} onPress={handleChoose}>
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { borderRadius: 18, borderWidth: 1.5, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  planName: { fontSize: 16, fontWeight: '700' },
  planPrice: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  planPeriod: { fontSize: 13, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  featuresList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13 },
  continueBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  continueBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
