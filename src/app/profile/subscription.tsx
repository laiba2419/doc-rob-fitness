import BackHeader from '@/components/BackHeader';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SubscriptionRow = {
  id: string;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  renews_at: string | null;
  payment_gateway: string | null;
  subscription_plans: {
    name: string;
    price: string;
    description: string;
  } | null;
};

type Tab = 'active' | 'history';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#16A34A' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
  expired: { bg: '#FEF3C7', text: '#B45309' },
};

export default function SubscriptionScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');
  const [activeSub, setActiveSub] = useState<SubscriptionRow | null>(null);
  const [history, setHistory] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setActiveSub(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('id, status, started_at, renews_at, payment_gateway, subscription_plans ( name, price, description )')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (error) {
      Alert.alert(t('profile.common.error'), error.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as SubscriptionRow[];
    setHistory(rows);
    setActiveSub(rows.find((r) => r.status === 'active') ?? null);
    setLoading(false);
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleCancel = () => {
    if (!activeSub) return;
    Alert.alert(t('profile.subscription.cancelTitle'), t('profile.subscription.cancelConfirmMessage'), [
      { text: t('profile.subscription.no'), style: 'cancel' },
      {
        text: t('profile.subscription.yesCancel'),
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', activeSub.id);
          setCancelling(false);
          if (error) {
            Alert.alert(t('profile.common.error'), error.message);
            return;
          }
          fetchData();
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.subscription.title')}</Text>

      <View style={styles.tabRow}>
        {(['active', 'history'] as Tab[]).map((tKey) => (
          <TouchableOpacity key={tKey} style={styles.tabBtn} onPress={() => setTab(tKey)}>
            <Text style={[styles.tabLabel, { color: tab === tKey ? theme.primary : theme.textSecondary }]}>
              {tKey === 'active' ? t('profile.subscription.active') : t('profile.subscription.history')}
            </Text>
            {tab === tKey && <View style={[styles.tabUnderline, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : tab === 'active' ? (
        activeSub ? (
          <View style={[styles.activeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.activeCardHeader}>
              <Text style={[styles.planName, { color: theme.text }]}>{activeSub.subscription_plans?.name}</Text>
              <Text style={[styles.planPrice, { color: theme.text }]}>{activeSub.subscription_plans?.price}</Text>
            </View>
            <Text style={styles.validText}>
              {activeSub.renews_at
                ? t('profile.subscription.validRange', { start: formatDate(activeSub.started_at), end: formatDate(activeSub.renews_at) })
                : t('profile.subscription.validSingle', { start: formatDate(activeSub.started_at) })}
            </Text>
            {!!activeSub.subscription_plans?.description && (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {activeSub.subscription_plans.description}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.primary, opacity: cancelling ? 0.6 : 1 }]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={[styles.cancelBtnText, { color: theme.primary }]}>{t('profile.subscription.cancelSubscription')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="document-text-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('profile.subscription.noPlansMessage')}</Text>
            <TouchableOpacity
              style={[styles.viewPlansBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/profile/subscription-plans' as any)}
            >
              <Text style={styles.viewPlansBtnText}>{t('profile.subscription.viewPlans')}</Text>
            </TouchableOpacity>
          </View>
        )
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
            <Ionicons name="time-outline" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('profile.subscription.noHistoryMessage')}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const colors = statusColors[item.status];
            return (
              <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.historyTopRow}>
                  <Text style={[styles.planName, { color: theme.text, fontSize: 14 }]}>
                    {item.subscription_plans?.name}
                  </Text>
                  <Text style={[styles.planPrice, { color: theme.text, fontSize: 14 }]}>
                    {item.subscription_plans?.price}
                  </Text>
                </View>
                <Text style={[styles.historyDates, { color: theme.textSecondary }]}>
                  {item.renews_at
                    ? t('profile.subscription.validRange', { start: formatDate(item.started_at), end: formatDate(item.renews_at) })
                    : t('profile.subscription.validSingle', { start: formatDate(item.started_at) })}
                </Text>
                <View style={styles.historyBottomRow}>
                  <Text style={[styles.gatewayText, { color: theme.textSecondary }]}>
                    • {item.payment_gateway ?? '—'}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusPillText, { color: colors.text }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 24, marginBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  tabBtn: { paddingBottom: 10 },
  tabLabel: { fontSize: 14, fontWeight: '700' },
  tabUnderline: { height: 2, borderRadius: 1, marginTop: 8 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  iconWrap: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  viewPlansBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14 },
  viewPlansBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  activeCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  activeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName: { fontSize: 16, fontWeight: '700' },
  planPrice: { fontSize: 16, fontWeight: '700' },
  validText: { color: '#16A34A', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  description: { fontSize: 12.5, lineHeight: 19, marginBottom: 20 },
  cancelBtn: { height: 46, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700' },

  historyCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyDates: { fontSize: 11.5, marginBottom: 10 },
  historyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gatewayText: { fontSize: 11.5 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
});