import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function usePreferences() {
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>(['1']);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('selected_workouts, selected_diets')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSelectedWorkouts(data.selected_workouts ?? ['1']);
        setSelectedDiets(data.selected_diets ?? []);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = useCallback(
    async (workouts: string[], diets: string[]) => {
      try {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');

        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            selected_workouts: workouts,
            selected_diets: diets,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Save failed' };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    selectedWorkouts,
    setSelectedWorkouts,
    selectedDiets,
    setSelectedDiets,
    loading,
    saving,
    savePreferences,
  };
}