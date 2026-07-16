// app/store/product.tsx
import { useCart } from '@/context/CartContext';
import { getProductById, Product } from '@/services/storeservice';
import { translateFields } from '@/lib/translate';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let isActive = true;
      setLoading(true);
      getProductById(id).then(async (data) => {
        const translated = data ? await translateFields(data, ['name', 'description'], i18n.language) : data;
        if (isActive) {
          setProduct(translated);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }, [id, i18n.language])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFound, { color: theme.text }]}>{t('store.noProductsFound')}</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => setIsFavorite((v) => !v)}
            hitSlop={10}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.name, { color: theme.text }]}>{product.name}</Text>
          <Text style={[styles.price, { color: theme.primary }]}>
            Rs. {product.price.toLocaleString()}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {product.description}
          </Text>

          {/* Quantity selector */}
          <View style={styles.qtyRow}>
            <Text style={[styles.qtyLabel, { color: theme.text }]}>{t('store.qty', { count: '' }).split(':')[0] || 'Quantity'}</Text>
            <View style={[styles.qtyControls, { borderColor: theme.border }]}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                hitSlop={8}
              >
                <Ionicons name="remove" size={18} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyValue, { color: theme.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => q + 1)}
                hitSlop={8}
              >
                <Ionicons name="add" size={18} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart */}
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Ionicons name={added ? 'checkmark' : 'cart-outline'} size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>
              {added ? t('store.orderPlacedTitle') : t('store.placeOrder')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  notFound: { textAlign: 'center', marginTop: 80, fontSize: 16 },
  scroll: { paddingBottom: 40 },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.3,
    backgroundColor: '#EDEDED',
    padding: 24,
  },
  image: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 50, left: 16 },
  favBtn: { position: 'absolute', top: 50, right: 16 },
  infoSection: { padding: 20 },
  name: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  divider: { height: 1, marginBottom: 16 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  qtyLabel: { fontSize: 15, fontWeight: '600' },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  qtyBtn: { padding: 10 },
  qtyValue: { fontSize: 15, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  addBtn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});