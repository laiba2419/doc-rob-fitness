// app/store/categories.tsx
import BackHeader from '@/components/BackHeader';
import { categories } from '@/data/store';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Categories</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/store/category', params: { id: item.id } } as any)}
          >
            <View style={styles.imageWrap}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48.5%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    paddingBottom: 12,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 14,
  },
  image: { width: '100%', height: '100%' },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 4 },
});