import BackHeader from '@/components/BackHeader';
import { useUserProfile } from '@/context/UserProfileContext';
import { getCategoryById, getMealsForUser } from '@/data/diets';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DietCategoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useUserProfile();

  const category = useMemo(() => getCategoryById(id ?? ''), [id]);

  const meals = useMemo(() => {
    if (!category) return [];
    const personalized = getMealsForUser(category, profile.age ?? undefined, profile.weight ?? undefined);
    return personalized.length > 0 ? personalized : category.meals;
  }, [category, profile.age, profile.weight]);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BackHeader />
        <Text style={[styles.title, { color: theme.text }]}>Diet not found</Text>
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
              <Text style={styles.proBadgeText}>Pro</Text>
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
  container: { flex: 1, padding: 20, paddingTop: 56 },
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