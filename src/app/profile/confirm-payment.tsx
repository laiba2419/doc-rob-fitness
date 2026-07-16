import BackHeader from '@/components/BackHeader';
import { getGateway } from '@/lib/gateways';
import { cancelReminderNotifications, scheduleExpiryReminders } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Plan = { id: string; name: string; price: string; price_cents: number; period: string; duration_days: number };

export default function ConfirmPaymentScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { planId, gateway, cardLast4, cardholderName, accountEmail } = useLocalSearchParams<{
    planId: string; gateway: string; cardLast4: string; cardholderName: string; accountEmail: string;
  }>();
  const gw = getGateway(gateway);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [renewsAt, setRenewsAt] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      const { data } = await supabase.from('subscription_plans').select('id, name, price, price_cents, period, duration_days').eq('id', planId).single();
      if (data) setPlan(data as Plan);
      setLoading(false);
    };
    if (planId) loadPlan();
  }, [planId]);

  const today = new Date();
  const orderId = `ORD-${Date.now().toString().slice(-8)}`;

  const handleConfirm = async () => {
    if (!plan) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert(t('profile.confirmPayment.notLoggedInTitle'), t('profile.confirmPayment.notLoggedInMessage'));

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // simulate processing

    const startedAtDate = new Date().toISOString();
    const renewsAtDate = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000);

    const { data: previousActive } = await supabase
      .from('user_subscriptions')
      .select('id, reminder_notification_ids')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (previousActive && previousActive.length > 0) {
      for (const row of previousActive) {
        if (row.reminder_notification_ids?.length) await cancelReminderNotifications(row.reminder_notification_ids);
      }
      await supabase.from('user_subscriptions').update({ status: 'expired', updated_at: startedAtDate }).eq('user_id', user.id).eq('status', 'active');
    }

    const reminderIds = await scheduleExpiryReminders(renewsAtDate, plan.name);

    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      started_at: startedAtDate,
      renews_at: renewsAtDate.toISOString(),
      payment_gateway: gw.id,
      payment_reference: orderId,
      card_brand: gw.name.toLowerCase(),
      card_last4: cardLast4,
      reminder_notification_ids: reminderIds,
    });

    setProcessing(false);
    if (error) return Alert.alert(t('profile.common.error'), error.message);

    setRenewsAt(renewsAtDate.toISOString());
    setSuccessVisible(true);
  };

  if (loading) {
    return <View style={[styles.screen, { backgroundColor: theme.background, justifyContent: 'center' }]}><ActivityIndicator color={theme.primary} /></View>;
  }

  const renewsLabel = renewsAt ? new Date(renewsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.confirmPayment.title')}</Text>

      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Row label={t('profile.confirmPayment.orderId')} value={orderId} theme={theme} />
        <Row label={t('profile.confirmPayment.date')} value={today.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} theme={theme} />
        <Row label={t('profile.confirmPayment.plan')} value={plan?.name ?? '—'} theme={theme} />
        <Row label={t('profile.confirmPayment.billingCycle')} value={plan?.period.replace('/', '') ?? '—'} theme={theme} />
        <Row label={t('profile.confirmPayment.paymentMethod')} value={`${gw.name} •••• ${cardLast4}`} theme={theme} />
        <Row label={t('profile.confirmPayment.accountHolder')} value={cardholderName ?? '—'} theme={theme} />
        {!!accountEmail && <Row label={t('profile.confirmPayment.receiptEmail')} value={accountEmail} theme={theme} />}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Row label={t('profile.confirmPayment.subtotal')} value={plan?.price ?? '—'} theme={theme} />
        <Row label={t('profile.confirmPayment.tax')} value="$0.00" theme={theme} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Row label={t('profile.confirmPayment.total')} value={plan?.price ?? '—'} theme={theme} bold />
      </View>

      <View style={[styles.noticeBox, { backgroundColor: theme.surface }]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.noticeText, { color: theme.textSecondary }]}>{t('profile.confirmPayment.demoNotice')}</Text>
      </View>

      <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: gw.accentColor, opacity: processing ? 0.7 : 1 }]} onPress={handleConfirm} disabled={processing}>
        {processing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmBtnText}>{t('profile.confirmPayment.confirmAndPay', { price: plan?.price })}</Text>}
      </TouchableOpacity>

      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={[styles.successIcon, { backgroundColor: gw.accentColor }]}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('profile.confirmPayment.successTitle')}</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              {t('profile.confirmPayment.successMessage', { plan: plan?.name, gateway: gw.name, date: renewsLabel })}
            </Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: gw.accentColor }]} onPress={() => { setSuccessVisible(false); router.replace('/profile/subscription' as any); }}>
              <Text style={styles.modalBtnText}>{t('profile.confirmPayment.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ label, value, theme, bold }: { label: string; value: string; theme: any; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text, fontWeight: bold ? '800' : '600', fontSize: bold ? 15 : 13 }]}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },

  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  rowLabel: {
    fontSize: 13,
  },

  rowValue: {
    fontSize: 13,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },

  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },

  noticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },

  confirmBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  modalBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
