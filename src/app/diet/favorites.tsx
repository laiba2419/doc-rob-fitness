import BackHeader from '@/components/BackHeader';
import { Meal } from '@/data/dietService';
import { getFavoriteMeals } from '@/data/favoritesService';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        setLoading(true);
        const favMeals = await getFavoriteMeals();
        if (isMounted) {
          setMeals(favMeals);
          setLoading(false);
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleRemove = async (mealId: string) => {
    // List se turant hata dein (optimistic) taake UI foran update ho
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    await toggleFavorite(mealId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', paddingHorizontal: 30 }}>
            You haven't added any meals to your favorites yet. Start exploring and add your favorite meals to see them here!
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {meals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={[styles.card, { backgroundColor: theme.surface }]}
              onPress={() => router.push({ pathname: '/diet/meal', params: { id: meal.id } })}
            >
              <Image source={{ uri: meal.image }} style={styles.image} />
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleRemove(meal.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart" size={20} color="#FF4757" />
              </TouchableOpacity>
              <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>
                {meal.name}
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
  list: { paddingBottom: 20 },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: 150 },
  heroOverlay: { position: 'absolute', top: -10, left: -10, right: -0 },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 6,
  },
  label: { fontSize: 14, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 10 },
});