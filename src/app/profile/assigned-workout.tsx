import BackHeader from '@/components/BackHeader';
import { useAssignedPlan } from '@/hooks/useAssignedPlan';
import { usePreferences } from '@/hooks/usePreferences';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AssignedWorkoutScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { selectedWorkouts, selectedDiets, loading: loadingPrefs } = usePreferences();
  const { workouts, meals, loading: loadingPlan, error } = useAssignedPlan(
    selectedWorkouts,
    selectedDiets,
    i18n.language,
  );

  const loading = loadingPrefs || loadingPlan;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile.assignedWorkout.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('profile.assignedWorkout.subtitle')}</Text>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{t('profile.assignedWorkout.errorPrefix', { message: error })}</Text>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('profile.assignedWorkout.todaysWorkout')}</Text>
            <View style={{ gap: 10 }}>
              {workouts.map((ex) => (
                <View key={ex.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
                    <Ionicons name="barbell-outline" size={18} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>{ex.name}</Text>
                    <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{ex.sets}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>{t('profile.assignedWorkout.dietPlan')}</Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {meals.map((meal) => (
                <View key={meal.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
                    <Ionicons name="restaurant-outline" size={18} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mealType, { color: theme.primary }]}>{meal.type}</Text>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>{meal.name}</Text>
                  </View>
                  <Text style={[styles.calorieText, { color: theme.textSecondary }]}>{meal.category}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 13 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  mealType: { fontSize: 11, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
  calorieText: { fontSize: 12, fontWeight: '600' },
});