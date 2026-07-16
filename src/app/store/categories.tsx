import BackHeader from '@/components/BackHeader';
import { Category, fetchCategories } from '@/services/storeservice';
import { translateList } from '@/lib/translate';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
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

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);
      fetchCategories().then(async (data) => {
        const translated = await translateList(data, ['label'], i18n.language);
        if (isActive) {
          setCategories(translated);
          setVisibleCount(PAGE_SIZE);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }, [i18n.language])
  );

  const visibleCategories = categories.slice(0, visibleCount);
  const hasMore = visibleCount < categories.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('store.categories')}</Text>

      <FlatList
        data={visibleCategories}
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
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
              {item.label}
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