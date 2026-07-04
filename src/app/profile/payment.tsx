import BackHeader from '@/components/BackHeader';
import { subscriptionPlans } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PaymentOption = { id: string; label: string; image: ImageSourcePropType };

const options: PaymentOption[] = [
  { id: 'Razorpay',   label: 'Razor Pay',   image: require('../../../assets/images/profile/razorpay.png') },
  { id: 'stripe', label: 'Stripe',      image: require('../../../assets/images/profile/stripe.png') },
  { id: 'paytm',   label: 'Paytm',       image: require('../../../assets/images/profile/paytm.png') },
  { id: 'flutterwave',   label: 'FlutterWave', image: require('../../../assets/images/profile/flutterwave.png') },
];

export default function PaymentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plan = subscriptionPlans.find((p) => p.id === planId) ?? subscriptionPlans[0];
  const [selected, setSelected] = useState('card');

  const handleConfirm = () => {
    Alert.alert(
      'Payment Successful',
      `You are now subscribed to the ${plan.name} plan (${plan.price}${plan.period}).`,
      [{ text: 'OK', onPress: () => router.replace('/profile/subscription' as any) }]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Payment Options</Text>

      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Selected Plan</Text>
        <Text style={[styles.summaryValue, { color: theme.text }]}>
          {plan.name} — {plan.price}{plan.period}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {options.map((opt) => {
          const active = selected === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionRow,
                { backgroundColor: theme.card, borderColor: active ? theme.primary : theme.border },
              ]}
              onPress={() => setSelected(opt.id)}
              activeOpacity={0.8}
            >
              <Image source={opt.image} style={styles.paymentIcon} resizeMode="contain" />
              <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={active ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.payBtn, { backgroundColor: theme.primary }]}
        onPress={handleConfirm}
      >
        <Text style={styles.payBtnText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  paymentIcon: { width: 36, height: 36 },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  payBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  payBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});