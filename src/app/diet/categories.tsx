import BackHeader from '@/components/BackHeader';
import { DietCategory, fetchDietCategories } from '@/data/dietService';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DietCategoriesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState<Omit<DietCategory, 'meals'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const cats = await fetchDietCategories(i18n.language);
      if (isMounted) {
        setCategories(cats);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  const openCategory = (categoryId: string) => {
    router.push({ pathname: '/diet/category', params: { id: categoryId } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('diet.categories')}</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.item}
              onPress={() => openCategory(cat.id)}
            >
              <Image source={{ uri: cat.image }} style={[styles.image, { borderColor: theme.border }]} />
              <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  item: { width: '47%', alignItems: 'center', marginBottom: 24 },
  image: { width: '100%', height: 110, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
