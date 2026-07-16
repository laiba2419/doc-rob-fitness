import BackHeader from '@/components/BackHeader';
import { Category, getCategoryById, getProductsByCategory, Product } from '@/services/storeservice';
import { translateFields, translateList } from '@/lib/translate';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
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

export default function CategoryScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let isActive = true;
      setLoading(true);
      Promise.all([getCategoryById(id), getProductsByCategory(id)]).then(async ([cat, prods]) => {
        const [translatedCat, translatedProds] = await Promise.all([
          cat ? translateFields(cat, ['label'], i18n.language) : Promise.resolve(cat),
          translateList(prods, ['name'], i18n.language),
        ]);
        if (isActive) {
          setCategory(translatedCat);
          setCategoryProducts(translatedProds);
          setVisibleCount(PAGE_SIZE);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }, [id, i18n.language])
  );

  const visibleProducts = categoryProducts.slice(0, visibleCount);
  const hasMore = visibleCount < categoryProducts.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BackHeader />
        <Text style={[styles.title, { color: theme.text }]}>{t('store.categoryNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{category.label}</Text>

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>{t('store.noProductsYet')}</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/store/product', params: { id: item.id } } as any)}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
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
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: { width: '48.5%', marginBottom: 18, borderRadius: 14, overflow: 'hidden', paddingBottom: 10 },
  imageWrap: {
    width: '100%',
    aspectRatio: 158 / 143,
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 14,
  },
  image: { width: '100%', height: '100%' },
  name: { fontSize: 13, fontWeight: '600', marginTop: 8, marginHorizontal: 10 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  seeMoreBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  seeMoreText: { fontSize: 14, fontWeight: '700' },
});