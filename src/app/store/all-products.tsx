// app/store/all-products.tsx
import { products } from '@/data/store';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AllProductsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [sortAsc, setSortAsc] = useState(true);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price)),
    [sortAsc]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>All Products</Text>
        <TouchableOpacity onPress={() => setSortAsc((v) => !v)} hitSlop={8}>
          <Ionicons name="swap-vertical-outline" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedProducts}
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
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  },
  image: { width: '100%', height: '100%' },
  name: { fontSize: 13, fontWeight: '600', marginTop: 8, marginHorizontal: 10 },
});