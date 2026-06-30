// app/store/index.tsx
import BottomNav from '@/components/BottomNav';
import { categories, products, searchProducts } from '@/data/store';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function StoreHomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredProducts = query.trim() ? searchProducts(query) : products.slice(0, 8);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Store</Text>

      <View style={[styles.searchBar, { borderColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search"
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
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
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
                   <Image source={cat.image} style={styles.categoryImage} resizeMode="contain" />
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
            {query ? `Results for "${query}"` : 'All Products'}
          </Text>
          {!query && (
            <TouchableOpacity onPress={() => router.push('/store/all-products' as any)} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textSecondary }]}>No products found.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => router.push({ pathname: '/store/product', params: { id: item.id } } as any)}
            >
              <View style={styles.productImageWrap}>
                <Image source={item.image} style={styles.productImage} resizeMode="contain" />
              </View>
              <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', marginHorizontal: 20, marginTop: 56, marginBottom: 14 },
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
  },
  productImage: { width: '100%', height: '100%' },
  productName: { fontSize: 13, fontWeight: '600', marginTop: 8, marginHorizontal: 10 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});