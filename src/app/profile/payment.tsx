import BackHeader from '@/components/BackHeader';
import { getGateway } from '@/lib/gateways';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Plan = { id: string; name: string; price: string; period: string };

const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function PaymentScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { planId, gateway } = useLocalSearchParams<{ planId: string; gateway: string }>();
  const gw = getGateway(gateway);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  useEffect(() => {
    const loadPlan = async () => {
      const { data } = await supabase.from('subscription_plans').select('id, name, price, period').eq('id', planId).single();
      if (data) setPlan(data as Plan);
    };
    if (planId) loadPlan();
  }, [planId]);

  const rawDigits = cardNumber.replace(/\D/g, '');
  const last4 = rawDigits.length >= 4 ? rawDigits.slice(-4) : '••••';

  const handleContinue = () => {
    if (rawDigits.length < 12) return Alert.alert(t('profile.payment.invalidCardTitle'), t('profile.payment.invalidCardMessage'));
    if (!cardholderName.trim()) return Alert.alert(t('profile.payment.nameRequiredTitle'), t('profile.payment.nameRequiredMessage'));
    if (expiry.length < 5) return Alert.alert(t('profile.payment.invalidExpiryTitle'), t('profile.payment.invalidExpiryMessage'));
    if (cvv.length < 3) return Alert.alert(t('profile.payment.invalidCvvTitle'), t('profile.payment.invalidCvvMessage'));

    router.push({
      pathname: '/profile/confirm-payment',
      params: { planId, gateway: gw.id, cardLast4: last4, cardholderName: cardholderName.trim(), accountEmail: accountEmail.trim() },
    } as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.payment.titlePrefix', { gateway: gw.name })}</Text>
      {plan && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{plan.name} · {plan.price}{plan.period}</Text>}

      <View style={[styles.cardMockup, { backgroundColor: gw.cardBg }]}>
        <View style={styles.cardMockupTopRow}>
          <Ionicons name="wifi-outline" size={22} color="rgba(255,255,255,0.85)" style={{ transform: [{ rotate: '90deg' }] }} />
          <Text style={styles.cardBrand}>{gw.brandText}</Text>
        </View>
        <Text style={styles.cardNumber}>{cardNumber ? formatCardNumber(cardNumber).padEnd(19, '•') : '•••• •••• •••• ••••'}</Text>
        <View style={styles.cardMockupBottomRow}>
          <View>
            <Text style={styles.cardLabel}>{t('profile.payment.accountHolderCardLabel')}</Text>
            <Text style={styles.cardValue}>{cardholderName.trim() || t('profile.payment.yourNamePlaceholder')}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>{t('profile.payment.expiresCardLabel')}</Text>
            <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>{t('profile.payment.accountHolderName')}</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} value={cardholderName} onChangeText={setCardholderName} placeholder={t('profile.payment.accountHolderName')} placeholderTextColor={theme.placeholder} />

        <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>{t('profile.payment.cardNumber')}</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} value={cardNumber} onChangeText={(v) => setCardNumber(formatCardNumber(v))} placeholder="1234 5678 9012 3456" placeholderTextColor={theme.placeholder} keyboardType="number-pad" maxLength={19} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>{t('profile.payment.expiry')}</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} value={expiry} onChangeText={(v) => setExpiry(formatExpiry(v))} placeholder="MM/YY" placeholderTextColor={theme.placeholder} keyboardType="number-pad" maxLength={5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>{t('profile.payment.cvv')}</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} value={cvv} onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))} placeholder="123" placeholderTextColor={theme.placeholder} keyboardType="number-pad" maxLength={4} secureTextEntry />
          </View>
        </View>

        <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>{t('profile.payment.accountEmail')}</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]} value={accountEmail} onChangeText={setAccountEmail} placeholder="you@example.com" placeholderTextColor={theme.placeholder} keyboardType="email-address" autoCapitalize="none" />
      </View>

      <TouchableOpacity style={[styles.continueBtn, { backgroundColor: gw.accentColor }]} onPress={handleContinue}>
        <Text style={styles.continueBtnText}>{t('profile.payment.reviewPayment')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  cardMockup: { borderRadius: 18, padding: 20, marginBottom: 20, minHeight: 160, justifyContent: 'space-between' },
  cardMockupTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  cardNumber: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', letterSpacing: 2, marginVertical: 18 },
  cardMockupBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '600', marginBottom: 4 },
  cardValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  continueBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});