import { supabase } from './supabase';

// Free translation API, no key needed
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text?.trim() || targetLang === 'en') return text;

  // 1. Check cache first
  const { data: cached } = await supabase
    .from('translation_cache')
    .select('translated_text')
    .eq('source_text', text)
    .eq('target_lang', targetLang)
    .maybeSingle();

  if (cached?.translated_text) return cached.translated_text;

  // 2. Not cached -> call translation API
  try {
    const res = await fetch(
      `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    const json = await res.json();
    const translated: string | undefined = json?.responseData?.translatedText;

    if (!translated) return text;

    // 3. Save to cache for next time (fire and forget)
    supabase
      .from('translation_cache')
      .insert({ source_text: text, target_lang: targetLang, translated_text: translated })
      .then(() => {});

    return translated;
  } catch {
    return text; // fallback: original English if API fails
  }
}

// Translate multiple fields of one object (e.g. { title, description })
export async function translateFields<T extends Record<string, any>>(
  item: T,
  fields: (keyof T)[],
  targetLang: string
): Promise<T> {
  if (targetLang === 'en') return item;
  const result = { ...item };
  await Promise.all(
    fields.map(async (field) => {
      const value = item[field];
      if (typeof value === 'string' && value.trim()) {
        result[field] = (await translateText(value, targetLang)) as any;
      }
    })
  );
  return result;
}

// Translate a whole list fetched from Supabase (e.g. exercises, products, meals)
export async function translateList<T extends Record<string, any>>(
  items: T[],
  fields: (keyof T)[],
  targetLang: string
): Promise<T[]> {
  if (targetLang === 'en' || !items?.length) return items;
  return Promise.all(items.map((item) => translateFields(item, fields, targetLang)));
}