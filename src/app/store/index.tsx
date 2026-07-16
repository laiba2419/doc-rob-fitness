import BottomNav from '@/components/BottomNav';
import { useCart } from '@/context/CartContext';
import { translateList } from '@/lib/translate';
import { Category, fetchCategories, fetchProducts, Product, searchProducts } from '@/services/storeservice';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const HOME_PRODUCTS_LIMIT = 6;

export default function StoreHomeScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { totalItems, addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);
      Promise.all([fetchCategories(), fetchProducts()]).then(async ([cats, prods]) => {
        const [translatedCats, translatedProds] = await Promise.all([
          translateList(cats, ['label'], i18n.language),
          translateList(prods, ['name'], i18n.language),
        ]);
        if (isActive) {
          setCategories(translatedCats);
          setProducts(translatedProds);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }, [i18n.language])
  );

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      searchProducts(query).then(async (results) => {
        const translated = await translateList(results, ['name'], i18n.language);
        setSearchResults(translated);
        setSearching(false);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, i18n.language]);

  const filteredProducts = query.trim() ? searchResults : products.slice(0, HOME_PRODUCTS_LIMIT);

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
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('store.title')}</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push('/store/cart' as any)}
          hitSlop={10}
        >
          <Ionicons name="cart-outline" size={26} color={theme.text} />
          {totalItems > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { borderColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('store.search') as string}
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.placeholder} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="search-outline" size={18} color={theme.placeholder} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {!query && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('store.categories')}</Text>
              <TouchableOpacity onPress={() => router.push('/store/categories' as any)} hitSlop={8}>
                <Ionicons name="chevron-forward" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => router.push({ pathname: '/store/category', params: { id: cat.id } } as any)}
                >
                  <View style={styles.categoryImageWrap}>
                    <Image source={{ uri: cat.image_url }} style={styles.categoryImage} resizeMode="contain" />
                  </View>
                  <Text style={[styles.categoryLabel, { color: theme.text }]} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {query ? t('store.resultsFor', { query }) : t('store.allProducts')}
          </Text>
          {!query && (
            <TouchableOpacity onPress={() => router.push('/store/all-products' as any)} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>

        {searching ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.textSecondary }]}>{t('store.noProductsFound')}</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push({ pathname: '/store/product', params: { id: item.id } } as any)}
              >
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: item.image_url }} style={styles.productImage} resizeMode="contain" />
                  <TouchableOpacity
                    style={[styles.plusBtn, { backgroundColor: theme.primary }]}
                    onPress={() => handleQuickAdd(item)}
                    hitSlop={8}
                  >
                    <Ionicons name={addedId === item.id ? 'checkmark' : 'add'} size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 56,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  cartBtn: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  categoryRow: { marginBottom: 22 },
  categoryCard: {
    width: 112,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    paddingBottom: 10,
  },
  categoryImageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 10,
  },
  categoryImage: { width: '100%', height: '100%' },
  categoryLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  row: { justifyContent: 'space-between' },
  productCard: { width: '48.5%', marginBottom: 18, borderRadius: 14, overflow: 'hidden', paddingBottom: 10 },
  productImageWrap: {
    width: '100%',
    aspectRatio: 158 / 143,
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 14,
    position: 'relative',
  },
  productImage: { width: '100%', height: '100%' },
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
  productName: { fontSize: 13, fontWeight: '600', marginTop: 8, marginHorizontal: 10 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});