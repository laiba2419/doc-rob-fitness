import { supabase } from '@/lib/supabase';
import { translateFields, translateList } from '@/lib/translate';

// ------- Types (same shape the screens already use) -------
export type Meal = {
  id: string;
  name: string;
  image: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  ingredients: { name: string; amount: string }[];
  instructions: string;
  isPro?: boolean;
  suitableForAgeMin?: number;
  suitableForAgeMax?: number;
  suitableForWeightMin?: number;
  suitableForWeightMax?: number;
};

export type DietCategory = {
  id: string;
  label: string;
  image: string;
  description: string;
  meals: Meal[];
};

// Featured / other meal ids shown on the main Diets screen (kept static — small curated list)
export const featuredDietMealIds = ['hc-1', 'lc-2'];
export const otherDietMealIds = ['veg-1', 'med-1', 'hc-3', 'hc-4', 'hc-5'];

const FALLBACK_LOCALE = 'en';

// ------- Row -> app type mappers -------
// ✅ Ab translation tables se nahi, seedha diet_categories / diet_meals ke
// apne (English) columns se data leta hai. Translation baad mein
// translateList/translateFields se live ho jati hai (Store/Home jaisa pattern).
function mapMealRow(row: any): Meal {
  return {
    id: row.id,
    name: row.name ?? '',
    image: row.image,
    calories: Number(row.calories),
    carbs: Number(row.carbs),
    protein: Number(row.protein),
    fat: Number(row.fat),
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? '',
    isPro: row.is_pro ?? false,
    suitableForAgeMin: row.suitable_age_min ?? undefined,
    suitableForAgeMax: row.suitable_age_max ?? undefined,
    suitableForWeightMin: row.suitable_weight_min != null ? Number(row.suitable_weight_min) : undefined,
    suitableForWeightMax: row.suitable_weight_max != null ? Number(row.suitable_weight_max) : undefined,
  };
}

// Meal ke ingredients ek array of objects hain ({ name, amount }) -- yeh
// translateList seedha handle nahi karti (wo top-level string fields ke
// liye hai), is liye har meal ke ingredients ko alag se translate karte hain.
async function translateMealIngredients(meal: Meal, locale: string): Promise<Meal> {
  if (!meal.ingredients || meal.ingredients.length === 0) return meal;
  const translatedIngredients = await translateList(meal.ingredients, ['name'], locale);
  return { ...meal, ingredients: translatedIngredients };
}

async function translateMeal(meal: Meal, locale: string): Promise<Meal> {
  const translated = await translateFields(meal, ['name', 'instructions'], locale);
  return translateMealIngredients(translated, locale);
}

async function translateMealsList(meals: Meal[], locale: string): Promise<Meal[]> {
  const translatedBase = await translateList(meals, ['name', 'instructions'], locale);
  return Promise.all(translatedBase.map((m) => translateMealIngredients(m, locale)));
}

// ------- Fetch functions (mirrors the Store pattern) -------
// Every fetch function still takes an optional `locale` param.
// Screens should pass i18n.language (from useTranslation()) here -- no
// screen-side changes needed, only this service changed internally.

// All categories, with just their own info (no meals) — used for the horizontal
// category rows on the Diets home screen and the Diet Categories grid screen.
export async function fetchDietCategories(locale: string = FALLBACK_LOCALE): Promise<Omit<DietCategory, 'meals'>[]> {
  const { data, error } = await supabase
    .from('diet_categories')
    .select('id, image, label, description')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('fetchDietCategories error:', error);
    return [];
  }

  const rows = (data ?? []).map((row) => ({
    id: row.id,
    image: row.image,
    label: row.label ?? '',
    description: row.description ?? '',
  }));

  if (locale === FALLBACK_LOCALE) return rows;
  return translateList(rows, ['label', 'description'], locale);
}

// A single category with all of its meals — used on the Diet Category detail screen.
export async function fetchDietCategoryWithMeals(
  categoryId: string,
  locale: string = FALLBACK_LOCALE
): Promise<DietCategory | null> {
  const { data: catRow, error: catError } = await supabase
    .from('diet_categories')
    .select('id, image, label, description')
    .eq('id', categoryId)
    .single();

  if (catError || !catRow) {
    console.error('fetchDietCategoryWithMeals category error:', catError);
    return null;
  }

  let category = {
    id: catRow.id,
    image: catRow.image,
    label: catRow.label ?? '',
    description: catRow.description ?? '',
  };
  if (locale !== FALLBACK_LOCALE) {
    category = await translateFields(category, ['label', 'description'], locale);
  }

  const { data: mealRows, error: mealError } = await supabase
    .from('diet_meals')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true });

  if (mealError) {
    console.error('fetchDietCategoryWithMeals meals error:', mealError);
    return { ...category, meals: [] };
  }

  const rows = mealRows ?? [];
  let meals = rows.map((row) => mapMealRow(row));
  if (locale !== FALLBACK_LOCALE) {
    meals = await translateMealsList(meals, locale);
  }

  return { ...category, meals };
}

// A single meal plus its parent category — used on the Meal detail screen.
export async function fetchMealById(
  mealId: string,
  locale: string = FALLBACK_LOCALE
): Promise<{ meal: Meal; category: Omit<DietCategory, 'meals'> } | null> {
  const { data: mealRow, error: mealError } = await supabase
    .from('diet_meals')
    .select('*')
    .eq('id', mealId)
    .single();

  if (mealError || !mealRow) {
    console.error('fetchMealById meal error:', mealError);
    return null;
  }

  const { data: catRow, error: catError } = await supabase
    .from('diet_categories')
    .select('id, image, label, description')
    .eq('id', mealRow.category_id)
    .single();

  if (catError || !catRow) {
    console.error('fetchMealById category error:', catError);
    return null;
  }

  let meal = mapMealRow(mealRow);
  let category = {
    id: catRow.id,
    image: catRow.image,
    label: catRow.label ?? '',
    description: catRow.description ?? '',
  };

  if (locale !== FALLBACK_LOCALE) {
    [meal, category] = await Promise.all([
      translateMeal(meal, locale),
      translateFields(category, ['label', 'description'], locale),
    ]);
  }

  return { meal, category };
}

// Fetch a specific list of meals by id (used for the "Featured" / "Other diets" rows).
export async function fetchMealsByIds(mealIds: string[], locale: string = FALLBACK_LOCALE): Promise<Meal[]> {
  if (mealIds.length === 0) return [];
  const { data, error } = await supabase
    .from('diet_meals')
    .select('*')
    .in('id', mealIds);

  if (error) {
    console.error('fetchMealsByIds error:', error);
    return [];
  }

  const rows = data ?? [];
  let mapped = rows.map((row) => mapMealRow(row));
  if (locale !== FALLBACK_LOCALE) {
    mapped = await translateMealsList(mapped, locale);
  }

  // Preserve the original requested order.
  return mealIds.map((id) => mapped.find((m) => m.id === id)).filter(Boolean) as Meal[];
}

// Filters meals within a category based on the user's age/weight stored in their profile.
// If a meal has no restriction set, it is treated as suitable for everyone.
export function getMealsForUser(category: DietCategory, userAge?: number, userWeight?: number): Meal[] {
  return category.meals.filter((meal) => {
    if (userAge != null && meal.suitableForAgeMin != null && userAge < meal.suitableForAgeMin) return false;
    if (userAge != null && meal.suitableForAgeMax != null && userAge > meal.suitableForAgeMax) return false;
    if (userWeight != null && meal.suitableForWeightMin != null && userWeight < meal.suitableForWeightMin) return false;
    if (userWeight != null && meal.suitableForWeightMax != null && userWeight > meal.suitableForWeightMax) return false;
    return true;
  });
}