import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { favoriteService } from '@/services/favoriteService';
import { FavoriteSearchParams } from '@/types/favorite';
import Toast from 'react-native-toast-message';

// Get all favorites with infinite scroll
export function useFavoritesInfinite(params: Omit<FavoriteSearchParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['favorites-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      favoriteService.getFavorites({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get all favorites (regular pagination)
export function useFavorites(params: FavoriteSearchParams = {}) {
  return useQuery({
    queryKey: ['favorites', params],
    queryFn: () => favoriteService.getFavorites(params),
    staleTime: 1000 * 60 * 2,
  });
}

// Check if product is favorite
export function useCheckFavorite(productId: number) {
  return useQuery({
    queryKey: ['favorite-check', productId],
    queryFn: () => favoriteService.checkIsFavorite(productId),
    enabled: !!productId && productId > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// Get favorite count
export function useFavoriteCount() {
  return useQuery({
    queryKey: ['favorite-count'],
    queryFn: () => favoriteService.getFavoriteCount(),
    staleTime: 1000 * 60 * 5,
  });
}

// Add to favorites mutation
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => favoriteService.addToFavorites(productId),
    onSuccess: (data, productId) => {
      // Invalidate and refetch favorites list
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-count'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-check', productId] });

      Toast.show({
        type: 'success',
        text1: 'Added to Favorites',
        text2: data.message || 'Product saved successfully',
        position: 'top',
        visibilityTime: 2000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to add to favorites';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
      });
    },
  });
}

// Remove from favorites mutation
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => favoriteService.removeFromFavorites(productId),
    onSuccess: (data, productId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-count'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-check', productId] });

      Toast.show({
        type: 'success',
        text1: 'Removed from Favorites',
        text2: data.message || 'Product removed successfully',
        position: 'top',
        visibilityTime: 2000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to remove from favorites';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
      });
    },
  });
}

// Toggle favorite (add or remove)
export function useToggleFavorite() {
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  return {
    toggleFavorite: (productId: number, isFavorite: boolean) => {
      if (isFavorite) {
        removeFromFavorites.mutate(productId);
      } else {
        addToFavorites.mutate(productId);
      }
    },
    isLoading: addToFavorites.isPending || removeFromFavorites.isPending,
  };
}