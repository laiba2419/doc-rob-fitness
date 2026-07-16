import BackHeader from '@/components/BackHeader';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CartScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/store/order-confirmation' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('store.cart')}</Text>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('store.cartEmpty')}</Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/store' as any)}
          >
            <Text style={styles.shopBtnText}>{t('store.browseProducts')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.itemRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Image source={{ uri: item.product.image_url }} style={styles.itemImage} resizeMode="contain" />

                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.primary }]}>
                    Rs. {item.product.price.toLocaleString()}
                  </Text>

                  <View style={styles.itemQtyRow}>
                    <View style={[styles.qtyControls, { borderColor: theme.border }]}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                        hitSlop={8}
                      >
                        <Ionicons name="remove" size={16} color={theme.text} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyValue, { color: theme.text }]}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                        hitSlop={8}
                      >
                        <Ionicons name="add" size={16} color={theme.text} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => removeFromCart(item.product.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                {t('store.itemsCount', { count: totalItems })}
              </Text>
              <Text style={[styles.summaryTotal, { color: theme.text }]}>
                Rs. {totalPrice.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>{t('store.placeOrder')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 100 },
  emptyText: { fontSize: 15 },
  shopBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  shopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  itemRow: {
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
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemPrice: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  itemQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  qtyBtn: { padding: 6 },
  qtyValue: { fontSize: 13, fontWeight: '700', minWidth: 22, textAlign: 'center' },
  summary: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14 },
  summaryTotal: { fontSize: 18, fontWeight: '700' },
  checkoutBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});