import { addFavorite, getFavoriteMealIds, removeFavorite } from '@/data/favoritesService';
import { useCallback, useEffect, useState } from 'react';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const ids = await getFavoriteMealIds();
      if (isMounted) {
        setFavoriteIds(new Set(ids));
        setLoaded(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const isFavorite = useCallback((mealId: string) => favoriteIds.has(mealId), [favoriteIds]);

  const toggleFavorite = useCallback(async (mealId: string) => {
    const currentlyFav = favoriteIds.has(mealId);

    // Optimistic update — heart turns red instantly, no waiting for the database
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (currentlyFav) next.delete(mealId);
      else next.add(mealId);
      return next;
    });

    const success = currentlyFav ? await removeFavorite(mealId) : await addFavorite(mealId);

    // Agar database save fail ho jaye to wapas purani state pe le aayen
    if (!success) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFav) next.add(mealId);
        else next.delete(mealId);
        return next;
      });
    }
  }, [favoriteIds]);

  return { isFavorite, toggleFavorite, loaded };
}