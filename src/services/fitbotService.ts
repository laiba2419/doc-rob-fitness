import { supabase } from '@/lib/supabase';

export type FaqItem = { id: string; question: string; answer: string };

export async function fetchFitbotFaqs(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from('fitbot_faqs')
    .select('id, question, answer')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('fetchFitbotFaqs error:', error);
    return [];
  }
  return data ?? [];
}