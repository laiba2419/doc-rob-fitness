import { supabase } from '@/lib/supabase';

// Same shape as src/data/report.ts so existing UI code (LineChart, FlatLists, etc.)
// doesn't need to change — only where the data comes from changes.
export type WeightEntry = { id: string; date: string; value: number };
export type CalorieEntry = { id: string; date: string; value: number };
export type StepsEntry = { id: string; date: string; value: number };

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

// ─── Weight ──────────────────────────────────────────────────────────────────

export async function fetchWeightEntries(): Promise<WeightEntry[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('weight_entries')
    .select('id, entry_date, value')
    .eq('user_id', userId)
    .order('entry_date', { ascending: true });

  if (error) {
    console.warn('Failed to fetch weight entries:', error.message);
    return [];
  }
  return (data ?? []).map((r) => ({ id: r.id, date: r.entry_date, value: Number(r.value) }));
}

export async function addWeightEntry(date: string, value: number): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not logged in' };

  const { error } = await supabase
    .from('weight_entries')
    .insert({ user_id: userId, entry_date: date, value });

  if (error) return { error: error.message };

  // Keep the profile's "latest weight" in sync too, since Home/BMI read it from there.
  await supabase.from('profiles').update({ weight: value, updated_at: new Date().toISOString() }).eq('id', userId);

  return { error: null };
}

// ─── Calories ────────────────────────────────────────────────────────────────

export async function fetchCalorieEntries(): Promise<CalorieEntry[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('calorie_entries')
    .select('id, entry_date, value')
    .eq('user_id', userId)
    .order('entry_date', { ascending: true });

  if (error) {
    console.warn('Failed to fetch calorie entries:', error.message);
    return [];
  }
  return (data ?? []).map((r) => ({ id: r.id, date: r.entry_date, value: Number(r.value) }));
}

export async function addCalorieEntry(date: string, value: number): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not logged in' };

  const { error } = await supabase
    .from('calorie_entries')
    .insert({ user_id: userId, entry_date: date, value });

  return { error: error?.message ?? null };
}

// ─── Steps ───────────────────────────────────────────────────────────────────

export async function fetchStepsEntries(): Promise<StepsEntry[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('steps_entries')
    .select('id, entry_date, value')
    .eq('user_id', userId)
    .order('entry_date', { ascending: true });

  if (error) {
    console.warn('Failed to fetch steps entries:', error.message);
    return [];
  }
  return (data ?? []).map((r) => ({ id: r.id, date: r.entry_date, value: Number(r.value) }));
}

export async function addStepsEntry(date: string, value: number): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not logged in' };

  const { error } = await supabase
    .from('steps_entries')
    .insert({ user_id: userId, entry_date: date, value });

  return { error: error?.message ?? null };
}

// ─── Shared helpers (same behavior as data/report.ts) ───────────────────────

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export function latestValue<T extends { date: string; value: number }>(entries: T[]): number | null {
  if (!entries.length) return null;
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].value;
}
