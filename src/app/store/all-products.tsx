import { fetchProducts, Product } from '@/services/storeservice';
import { translateList } from '@/lib/translate';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PAGE_SIZE = 30;

export default function AllProductsScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { addToCart } = useCart();
  const [sortAsc, setSortAsc] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [addedId, setAddedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);
      fetchProducts().then(async (data) => {
        const translated = await translateList(data, ['name'], i18n.language);
        if (isActive) {
          setProducts(translated);
          setVisibleCount(PAGE_SIZE);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }, [i18n.language])
  );

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price)),
    [products, sortAsc]
  );

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  const handleQuickAdd = (item: Product) => {
    addToCart(item, 1);
    setAddedId(item.id);
    setTimeout(() => setAddedId((current) => (current === item.id ? null : current)), 1200);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('store.allProducts')}</Text>
        <TouchableOpacity onPress={() => setSortAsc((v) => !v)} hitSlop={8}>
          <Ionicons name="swap-vertical-outline" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/store/product', params: { id: item.id } } as any)}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
              <TouchableOpacity
                style={[styles.plusBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleQuickAdd(item)}
                hitSlop={8}
              >
                <Ionicons name={addedId === item.id ? 'checkmark' : 'add'} size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={[styles.seeMoreBtn, { borderColor: theme.primary }]}
              onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              <Text style={[styles.seeMoreText, { color: theme.primary }]}>{t('store.seeMore')}</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 56,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: { width: '48.5%', marginBottom: 18, borderRadius: 14, overflow: 'hidden', paddingBottom: 10 },
  imageWrap: {
    width: '100%',
    aspectRatio: 158 / 143,
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 14,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  plusBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 13, fontWeight: '600', marginTop: 8, marginHorizontal: 10 },
  seeMoreBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  seeMoreText: { fontSize: 14, fontWeight: '700' },
});