import BackHeader from '@/components/BackHeader';
import { useUserProfile } from '@/context/UserProfileContext';
import { DietCategory, fetchDietCategoryWithMeals, getMealsForUser, Meal } from '@/data/dietService';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DietCategoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useUserProfile();
  const { t, i18n } = useTranslation();

  const [category, setCategory] = useState<DietCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const cat = await fetchDietCategoryWithMeals(id ?? '', i18n.language);
      if (isMounted) {
        setCategory(cat);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id, i18n.language]);

  const meals: Meal[] = useMemo(() => {
    if (!category) return [];
    const personalized = getMealsForUser(category, profile.age ?? undefined, profile.weight ?? undefined);
    return personalized.length > 0 ? personalized : category.meals;
  }, [category, profile.age, profile.weight]);

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
        <Text style={[styles.title, { color: theme.text }]}>{t('diet.categoryNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{category.label}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {meals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push({ pathname: '/diet/meal', params: { id: meal.id } })}
          >
            <Image source={{ uri: meal.image }} style={styles.image} />
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>{t('diet.pro')}</Text>
            </View>
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>
              {meal.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: 150 },
  proBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFC93C',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadgeText: { fontSize: 10, fontWeight: '700', color: '#1A1A1A' },
  label: { fontSize: 14, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 10 },
});
