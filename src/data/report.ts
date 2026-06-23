// ─── Types ───────────────────────────────────────────────────────────────────

export type WeightEntry = { id: string; date: string; value: number };   // kg
export type CalorieEntry = { id: string; date: string; value: number };  // kcal
export type StepsEntry = { id: string; date: string; value: number };    // steps

// ─── Sample Data ─────────────────────────────────────────────────────────────

export const weightEntries: WeightEntry[] = [
  { id: 'w1', date: '2025-06-01', value: 82 },
  { id: 'w2', date: '2025-06-05', value: 81.2 },
  { id: 'w3', date: '2025-06-10', value: 80.5 },
  { id: 'w4', date: '2025-06-15', value: 79.8 },
  { id: 'w5', date: '2025-06-20', value: 79.1 },
  { id: 'w6', date: '2025-06-25', value: 78.5 },
  { id: 'w7', date: '2025-06-30', value: 77.9 },
];

export const calorieEntries: CalorieEntry[] = [
  { id: 'c1', date: '2025-06-24', value: 1850 },
  { id: 'c2', date: '2025-06-25', value: 2100 },
  { id: 'c3', date: '2025-06-26', value: 1920 },
  { id: 'c4', date: '2025-06-27', value: 2250 },
  { id: 'c5', date: '2025-06-28', value: 1780 },
  { id: 'c6', date: '2025-06-29', value: 2050 },
  { id: 'c7', date: '2025-06-30', value: 1990 },
];

export const stepsEntries: StepsEntry[] = [
  { id: 's1', date: '2025-06-24', value: 7200 },
  { id: 's2', date: '2025-06-25', value: 9800 },
  { id: 's3', date: '2025-06-26', value: 6500 },
  { id: 's4', date: '2025-06-27', value: 11200 },
  { id: 's5', date: '2025-06-28', value: 8900 },
  { id: 's6', date: '2025-06-29', value: 10300 },
  { id: 's7', date: '2025-06-30', value: 7800 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export function latestWeight(entries: WeightEntry[]): number | null {
  if (!entries.length) return null;
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].value;
}

export function latestCalories(entries: CalorieEntry[]): number | null {
  if (!entries.length) return null;
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].value;
}

export function latestSteps(entries: StepsEntry[]): number | null {
  if (!entries.length) return null;
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].value;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
