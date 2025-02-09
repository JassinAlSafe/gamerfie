import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGamesStore } from '@/stores/useGamesStore';
import { CategoryId } from '@/components/explore/ExplorePage.definition';

export function useGameCategories() {
  const router = useRouter();
  const setSelectedCategory = useGamesStore((state) => state.setSelectedCategory);

  const handleCategoryClick = useCallback(
    (category: CategoryId) => {
      setSelectedCategory(category);
      router.push(`/all-games?category=${category}&timeRange=${category}`);
    },
    [router, setSelectedCategory]
  );

  return { handleCategoryClick };
}