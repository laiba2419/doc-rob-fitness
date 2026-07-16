import BottomNav from '@/components/BottomNav';
import { useUserProfile } from '@/context/UserProfileContext';
import { DietCategory, featuredDietMealIds, fetchDietCategories, fetchMealsByIds, Meal, otherDietMealIds } from '@/data/dietService';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DietsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile } = useUserProfile();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState<Omit<DietCategory, 'meals'>[]>([]);
  const [featuredMeals, setFeaturedMeals] = useState<Meal[]>([]);
  const [otherMeals, setOtherMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  console.log('lang:', i18n.language);
  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      const [cats, featured, other] = await Promise.all([
        fetchDietCategories(i18n.language),
        fetchMealsByIds(featuredDietMealIds, i18n.language),
        fetchMealsByIds(otherDietMealIds, i18n.language),
      ]);
      if (!isMounted) return;
      setCategories(cats);
      setFeaturedMeals(featured);
      setOtherMeals(other);
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  const openCategory = (categoryId: string) => {
    router.push({ pathname: '/diet/category', params: { id: categoryId } });
  };

  const openMeal = (mealId: string) => {
    router.push({ pathname: '/diet/meal', params: { id: mealId } });
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('diet.title')}</Text>
          <TouchableOpacity onPress={() => router.push('/diet/favorites')}>
            <Ionicons name="heart-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Diet Categories — swipeable row, arrow opens the full categories grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('diet.categories')}</Text>
          <TouchableOpacity onPress={() => router.push('/diet/categories')}>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => openCategory(cat.id)}
            >
              <Image source={{ uri: cat.image }} style={[styles.categoryImage, { borderColor: theme.border }]} />
              <Text style={[styles.categoryLabel, { color: theme.textSecondary }]} numberOfLines={2}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured diets */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>{t('diet.featured')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRow}
        >
          {featuredMeals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={[styles.featuredCard, { backgroundColor: theme.surface }]}
              onPress={() => openMeal(meal.id)}
            >
              <Image source={{ uri: meal.image }} style={styles.featuredImage} />
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>{t('diet.pro')}</Text>
              </View>
              <TouchableOpacity
                style={styles.featuredHeart}
                onPress={() => toggleFavorite(meal.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isFavorite(meal.id) ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isFavorite(meal.id) ? '#FF4757' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <Text style={[styles.featuredLabel, { color: theme.text }]} numberOfLines={2}>
                {meal.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Other diets */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('diet.other')}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>

        {otherMeals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={styles.otherRow}
            onPress={() => openMeal(meal.id)}
          >
            <Image source={{ uri: meal.image }} style={styles.otherImage} />
            <View style={styles.otherTextWrap}>
              <Text style={[styles.otherLabel, { color: theme.text }]} numberOfLines={2}>
                {meal.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(meal.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite(meal.id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite(meal.id) ? '#FF4757' : theme.textSecondary}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingTop: 56, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  categoryRow: { gap: 14, paddingBottom: 4 },
  categoryItem: { width: 76, alignItems: 'center' },
  categoryImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, marginBottom: 6 },
  categoryLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  featuredRow: { gap: 14, paddingBottom: 4 },
  featuredCard: { width: 160, borderRadius: 16, overflow: 'hidden', paddingBottom: 10 },
  featuredImage: { width: '100%', height: 110 },
  proBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFC93C',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadgeText: { fontSize: 10, fontWeight: '700', color: '#1A1A1A' },
  featuredHeart: { position: 'absolute', top: 8, right: 8 },
  featuredLabel: { fontSize: 13, fontWeight: '600', paddingHorizontal: 10, paddingTop: 8 },
  otherRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  otherImage: { width: 64, height: 64, borderRadius: 12 },
  otherTextWrap: { flex: 1 },
  otherLabel: { fontSize: 14, fontWeight: '600' },
});
