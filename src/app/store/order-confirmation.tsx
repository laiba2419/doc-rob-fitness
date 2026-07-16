import BackHeader from '@/components/BackHeader';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/services/storeservice';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OrderConfirmationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { items, clearCart, totalPrice, totalItems } = useCart();
  const [placing, setPlacing] = useState(false);

  const orderDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleConfirm = async () => {
    if (placing || items.length === 0) return;
    setPlacing(true);

    for (const item of items) {
      const { error } = await placeOrder(item.product.id, item.quantity);
      if (error) {
        setPlacing(false);
        Alert.alert(t('store.checkoutFailed'), error);
        return;
      }
    }

    setPlacing(false);
    clearCart();
    router.replace('/store/order-success' as any);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BackHeader />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {t('store.cartEmptyConfirm')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('store.confirmYourOrder')}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {t('store.orderDate', { date: orderDate })}
        </Text>

        {items.map((item) => (
          <View
            key={item.product.id}
            style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Image source={{ uri: item.product.image_url }} style={styles.itemImage} resizeMode="contain" />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={[styles.itemDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.product.description}
              </Text>
              <View style={styles.itemFooterRow}>
                <Text style={[styles.itemQty, { color: theme.textSecondary }]}>
                  {t('store.qty', { count: item.quantity })}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {t('store.itemsCount', { count: totalItems })}
            </Text>
            <Text style={[styles.summaryTotal, { color: theme.text }]}>
              Rs. {totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
          onPress={handleConfirm}
          disabled={placing}
        >
          <Text style={styles.confirmBtnText}>
            {placing ? t('store.placingOrder') : t('store.confirmOrder')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 4 },
  emptyText: { fontSize: 15, textAlign: 'center', marginTop: 40 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  dateText: { fontSize: 13, marginBottom: 16 },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
  },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemDescription: { fontSize: 12, marginTop: 4 },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemQty: { fontSize: 13 },
  itemPrice: { fontSize: 14, fontWeight: '700' },
  summary: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14 },
  summaryTotal: { fontSize: 18, fontWeight: '700' },
  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  confirmBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});