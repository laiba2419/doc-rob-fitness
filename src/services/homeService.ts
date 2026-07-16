import { supabase } from '@/lib/supabase';
import { createNotification } from './notificationServie';

export type BodyPart = { id: string; label: string };
export type Equipment = { id: string; label: string };
export type WorkoutType = { id: string; label: string; meta: string; is_pro: boolean };
export type WorkoutLevel = { id: string; label: string; meta: string };
export type Exercise = { id: string; title: string; meta: string };
export type WorkoutOption = { id: string; title: string; meta: string };

export async function fetchBodyParts(): Promise<BodyPart[]> {
  const { data, error } = await supabase
    .from('body_parts')
    .select('id, label')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchBodyParts error:', error);
    return [];
  }
  return data ?? [];
}

export async function fetchEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('id, label')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchEquipment error:', error);
    return [];
  }
  return data ?? [];
}

export async function fetchWorkoutTypes(): Promise<WorkoutType[]> {
  const { data, error } = await supabase
    .from('workout_types')
    .select('id, label, meta, is_pro')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchWorkoutTypes error:', error);
    return [];
  }
  return data ?? [];
}

export async function fetchWorkoutLevels(): Promise<WorkoutLevel[]> {
  const { data, error } = await supabase
    .from('workout_levels')
    .select('id, label, meta')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchWorkoutLevels error:', error);
    return [];
  }
  return data ?? [];
}

// ✅ FIX: workout_levels.id comes back as "Beginner" / "Intermediate" /
// "Advance" (capitalized) from Supabase, but exercises.category_id is stored
// lowercase ("beginner", "intermediate") -- and "Advance" specifically maps
// to TWO rows ("advance-1", "advance-2"), not one. The old .eq() call did an
// exact, case-sensitive match, so it never matched anything for any level --
// that's why every level showed "No exercises found for this level yet".
//
// ilike() makes the match case-insensitive, and for "advance" we match the
// "advance%" prefix so both advance-1 and advance-2 rows come back under the
// single "Advance" level card.
export async function fetchExercisesFor(categoryType: 'type' | 'level', categoryId: string): Promise<Exercise[]> {
  const normalized = categoryId.trim().toLowerCase();

  let query = supabase
    .from('exercises')
    .select('id, title, meta')
    .eq('category_type', categoryType);

  if (categoryType === 'level' && normalized === 'advance') {
    query = query.ilike('category_id', 'advance%');
  } else {
    query = query.ilike('category_id', normalized);
  }

  const { data, error } = await query.order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchExercisesFor error:', error);
    return [];
  }
  return data ?? [];
}

export async function fetchWorkoutOptions(): Promise<WorkoutOption[]> {
  const { data, error } = await supabase
    .from('workout_options')
    .select('id, title, meta')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('fetchWorkoutOptions error:', error);
    return [];
  }
  return data ?? [];
}

// ─── User schedule (per-user, persisted) ────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

export type UserScheduleResult = {
  // date -> workout/exercise id, e.g. { "2026-06-29": "push-day" }
  schedule: Record<string, string>;
  // date -> level id, only present for dates scheduled through the level
  // wizard / Workout Levels section, e.g. { "2026-06-29": "beginner" }
  levels: Record<string, string>;
};

// Returns both the day -> workout mapping and the day -> level mapping,
// read straight from user_schedule (level_id column), so the level a day
// was scheduled at survives app restarts.
export async function fetchUserSchedule(): Promise<UserScheduleResult> {
  const userId = await getUserId();
  if (!userId) return { schedule: {}, levels: {} };

  const { data, error } = await supabase
    .from('user_schedule')
    .select('date, workout_id, level_id')
    .eq('user_id', userId);

  if (error) {
    console.error('fetchUserSchedule error:', error);
    return { schedule: {}, levels: {} };
  }

  const schedule: Record<string, string> = {};
  const levels: Record<string, string> = {};
  (data ?? []).forEach((row) => {
    schedule[row.date] = row.workout_id;
    if (row.level_id) {
      levels[row.date] = row.level_id;
    }
  });
  return { schedule, levels };
}

// Assign (or change) the workout for a specific date.
// workoutTitle is passed in purely so we can write a readable notification --
// it is not stored in user_schedule itself.
// levelId is optional: pass it when the item was picked via the level
// wizard / Workout Levels section so it's remembered for the banner; pass
// undefined/null (or omit) when it wasn't, which clears any previously
// stored level for that date (matches the row being fully replaced).
export async function setScheduleForDate(
  dateKey: string,
  workoutId: string,
  workoutTitle: string,
  levelId?: string | null
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('user_schedule')
    .upsert(
      { user_id: userId, date: dateKey, workout_id: workoutId, level_id: levelId ?? null },
      { onConflict: 'user_id,date' }
    );

  if (error) {
    console.error('setScheduleForDate error:', error);
    return false;
  }

  // Schedule save hone ke baad ek notification bhi bana dete hain,
  // taake Notifications screen pe user ko dikh jaye.
  await createNotification(
    'Workout Scheduled',
    `${workoutTitle} assigned for ${dateKey}`,
    'calendar-outline'
  );

  return true;
}
export async function removeScheduleForDate(dateKey: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('user_schedule')
    .delete()
    .eq('user_id', userId)
    .eq('date', dateKey);

  if (error) {
    console.error('removeScheduleForDate error:', error);
    return false;
  }

  await createNotification(
    'Workout Removed',
    `Workout removed for ${dateKey}`,
    'trash-outline'
  );

  return true;
}
