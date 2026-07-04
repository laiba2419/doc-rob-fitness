import BackHeader from '@/components/BackHeader';
import { assignedDiet, assignedWorkout } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AssignedWorkoutScreen() {
  const { theme } = useTheme();
  const totalCalories = assignedDiet.reduce((sum, m) => sum + m.calories, 0);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Assigned Workout & Diet</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Personalized by your trainer</Text>

        <Text style={[styles.sectionLabel, { color: theme.text }]}>Today's Workout</Text>
        <View style={{ gap: 10 }}>
          {assignedWorkout.map((ex) => (
            <View key={ex.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
                <Ionicons name={ex.icon as any} size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{ex.name}</Text>
                <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{ex.sets}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.dietHeaderRow}>
          <Text style={[styles.sectionLabel, { color: theme.text, marginBottom: 0 }]}>Diet Plan</Text>
          <Text style={[styles.calorieTotal, { color: theme.primary }]}>{totalCalories} kcal</Text>
        </View>
        <View style={{ gap: 10, marginBottom: 20 }}>
          {assignedDiet.map((meal) => (
            <View key={meal.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
                <Ionicons name="restaurant-outline" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mealType, { color: theme.primary }]}>{meal.type}</Text>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{meal.name}</Text>
              </View>
              <Text style={[styles.calorieText, { color: theme.textSecondary }]}>{meal.calories} kcal</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  dietHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  calorieTotal: { fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 13 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  mealType: { fontSize: 11, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
  calorieText: { fontSize: 12, fontWeight: '600' },
});
