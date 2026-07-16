import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { translateList } from '@/lib/translate';

// Shape must match what BlogScreen / BlogDetailScreen already expect
export type BlogPost = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
};

const FALLBACK_LOCALE = 'en';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapRowToBlogPost(row: {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  fetched_at: string;
}): BlogPost {
  const description = row.description ?? '';
  return {
    id: row.id,
    date: formatDate(row.fetched_at),
    title: row.title,
    excerpt: description.length > 120 ? description.slice(0, 120) + '…' : description,
    content: description,
    image: row.image_url ?? 'https://placehold.co/600x400?text=No+Image',
  };
}

export function useBlogPosts(locale: string = FALLBACK_LOCALE) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('daily_fitness_content')
        .select('id, title, description, image_url, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      const rows = data ?? [];

      // Only keep rows from the most recent fetch date, so once new
      // content comes in for "today", older days automatically drop off.
      const latestDateKey = rows[0]
        ? new Date(rows[0].fetched_at).toDateString()
        : null;

      const latestRows = latestDateKey
        ? rows.filter((r) => new Date(r.fetched_at).toDateString() === latestDateKey)
        : rows;

      const mapped = latestRows.map(mapRowToBlogPost);

      if (locale === FALLBACK_LOCALE) {
        setPosts(mapped);
      } else {
        const translated = await translateList(mapped, ['title', 'excerpt', 'content'], locale);
        setPosts(translated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}