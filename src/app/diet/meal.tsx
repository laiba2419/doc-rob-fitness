import BackHeader from '@/components/BackHeader';
import { fetchMealById, Meal } from '@/data/dietService';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'ingredients' | 'instructions';

export default function DietMealScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, i18n } = useTranslation();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const result = await fetchMealById(id ?? '', i18n.language);
      if (isMounted) {
        setMeal(result ? result.meal : null);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id, i18n.language]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BackHeader />
        <Text style={[styles.title, { color: theme.text }]}>{t('diet.notFound')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: meal.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <BackHeader />
          </View>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>{t('diet.pro')}</Text>
          </View>
          <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(meal.id)}>
            <Ionicons
              name={isFavorite(meal.id) ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite(meal.id) ? '#FF4757' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { backgroundColor: theme.background }]}>
          <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>

          <View style={styles.macroRow}>
            <MacroStat label={t('diet.kcal')} value={`${meal.calories}`} theme={theme} />
            <MacroStat label={t('diet.carbs')} value={`${meal.carbs} g`} theme={theme} />
            <MacroStat label={t('diet.protein')} value={`${meal.protein} g`} theme={theme} />
            <MacroStat label={t('diet.fat')} value={`${meal.fat} g`} theme={theme} />
          </View>

          <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'ingredients' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text style={[styles.tabLabel, { color: activeTab === 'ingredients' ? theme.text : theme.textSecondary }]}>
                {t('diet.ingredients')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'instructions' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text style={[styles.tabLabel, { color: activeTab === 'instructions' ? theme.text : theme.textSecondary }]}>
                {t('diet.instructions')}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'ingredients' ? (
            <View style={styles.tabContent}>
              {meal.ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <Text style={[styles.ingredientName, { color: theme.text }]}>{ing.name}</Text>
                  <Text style={[styles.ingredientAmount, { color: theme.textSecondary }]}>{ing.amount}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.instructionsText, { color: theme.text }]}>{meal.instructions}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MacroStat({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', margin: 20 },
  heroImage: { width: '100%', height: 260 },
  heroOverlay: { position: 'absolute', top: -10, left: -0, right: -0 },
  proBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FFC93C',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: { fontSize: 11, fontWeight: '700', color: '#1A1A1A' },
  heartButton: {
    position: 'absolute',
    top: 50,
    right: 60,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 6,
  },
  body: { padding: 20, paddingTop: 18 },
  mealName: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue: { fontSize: 15, fontWeight: '700' },
  macroLabel: { fontSize: 12, marginTop: 2 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  tabContent: { paddingBottom: 24 },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  ingredientName: { fontSize: 14, fontWeight: '500' },
  ingredientAmount: { fontSize: 14, fontWeight: '600' },
  instructionsText: { fontSize: 14, lineHeight: 22 },
});
