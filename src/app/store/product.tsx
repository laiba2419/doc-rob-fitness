// app/store/product.tsx
import { getProductById } from '@/data/store';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useMemo(() => getProductById(id ?? ''), [id]);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFound, { color: theme.text }]}>Product not found</Text>
      </View>
    );
  }

  const handleBuyNow = () => {
    Alert.alert('Order Placed!', `"${product.name}" has been added to your cart.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrap}>
          <Image source={product.image} style={styles.image} resizeMode="contain" />
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

          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: theme.primary }]}
            onPress={handleBuyNow}
            activeOpacity={0.85}
          >
            <Text style={styles.buyText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  description: { fontSize: 14, lineHeight: 22, marginBottom: 28 },
  buyButton: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});