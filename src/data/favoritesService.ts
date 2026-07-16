import { supabase } from '@/lib/supabase';
import { Meal } from './dietService';

// mapMealRow is not exported from dietService yet — see note below
import { fetchMealsByIds } from './dietService';

export async function getFavoriteMealIds(): Promise<string[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_favorites')
    .select('meal_id')
    .eq('user_id', userId);

  if (error) {
    console.error('getFavoriteMealIds error:', error);
    return [];
  }
  return (data ?? []).map((row) => row.meal_id);
}

export async function getFavoriteMeals(): Promise<Meal[]> {
  const ids = await getFavoriteMealIds();
  if (ids.length === 0) return [];
  return fetchMealsByIds(ids);
}

export async function addFavorite(mealId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return false;

  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, meal_id: mealId });

  if (error) {
    console.error('addFavorite error:', error);
    return false;
  }
  return true;
}

export async function removeFavorite(mealId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return false;

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('meal_id', mealId);

  if (error) {
    console.error('removeFavorite error:', error);
    return false;
  }
  return true;
}