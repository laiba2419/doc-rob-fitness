import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { translateList } from '@/lib/translate';

export type AssignedWorkoutItem = {
  id: string;
  name: string;
  sets: string;
};

export type AssignedMealItem = {
  id: string;
  type: string;
  name: string;
  category: string;
};

// Maps Preferred Workouts card IDs to wger.de exercise categories
const WORKOUT_ID_TO_CATEGORY: Record<string, string> = {
  '1': 'Abs',
  '2': 'Arms',
  '3': 'Back',
  '4': 'Chest',
  '5': 'Legs',
  '6': 'Shoulders',
  '7': 'Calves',
};

const FALLBACK_LOCALE = 'en';

export function useAssignedPlan(
  selectedWorkoutIds: string[] = [],
  selectedDietLabels: string[] = [],
  locale: string = FALLBACK_LOCALE,
) {
  const [workouts, setWorkouts] = useState<AssignedWorkoutItem[]>([]);
  const [meals, setMeals] = useState<AssignedMealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const workoutCategories = selectedWorkoutIds
        .map((id) => WORKOUT_ID_TO_CATEGORY[id])
        .filter(Boolean);

      // ---------- Exercises ----------
      let exerciseQuery = supabase
        .from('daily_fitness_content')
        .select('id, title, description, category')
        .eq('content_type', 'exercise')
        .order('fetched_at', { ascending: false })
        .limit(4);

      if (workoutCategories.length > 0) {
        exerciseQuery = exerciseQuery.in('category', workoutCategories);
      }

      const exerciseRes = await exerciseQuery;
      if (exerciseRes.error) throw exerciseRes.error;

      // Fallback: if no match for chosen categories, show latest exercises anyway
      let exerciseRows = exerciseRes.data ?? [];
      if (exerciseRows.length === 0 && workoutCategories.length > 0) {
        const fallback = await supabase
          .from('daily_fitness_content')
          .select('id, title, description, category')
          .eq('content_type', 'exercise')
          .order('fetched_at', { ascending: false })
          .limit(4);
        if (fallback.error) throw fallback.error;
        exerciseRows = fallback.data ?? [];
      }

      let workoutItems: AssignedWorkoutItem[] = exerciseRows.map((row) => ({
        id: row.id,
        name: row.title,
        sets: row.category ?? 'Recommended exercise',
      }));

      if (locale !== FALLBACK_LOCALE) {
        workoutItems = await translateList(workoutItems, ['name', 'sets'], locale);
      }

      setWorkouts(workoutItems);

      // ---------- Meals ----------
      let mealQuery = supabase
        .from('daily_fitness_content')
        .select('id, title, description, category')
        .eq('content_type', 'meal')
        .order('fetched_at', { ascending: false })
        .limit(3);

      const mealRes = await mealQuery;
      if (mealRes.error) throw mealRes.error;

      let mealRows = mealRes.data ?? [];

      // Try to prioritize meals matching selected diet labels (case-insensitive)
      if (selectedDietLabels.length > 0) {
        const lowerLabels = selectedDietLabels.map((l) => l.toLowerCase());
        const matched = mealRows.filter((m) =>
          m.category && lowerLabels.includes(m.category.toLowerCase()),
        );
        if (matched.length > 0) {
          mealRows = matched;
        }
        // if no match at all, keep the latest meals as a graceful fallback
      }

      const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
      let mealItems: AssignedMealItem[] = mealRows.map((row, index) => ({
        id: row.id,
        type: mealTypes[index] ?? 'Snack',
        name: row.title,
        category: row.category ?? '',
      }));

      if (locale !== FALLBACK_LOCALE) {
        mealItems = await translateList(mealItems, ['type', 'name', 'category'], locale);
      }

      setMeals(mealItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assigned plan');
      setWorkouts([]);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkoutIds, selectedDietLabels, locale]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { workouts, meals, loading, error, refetch: fetchPlan };
}