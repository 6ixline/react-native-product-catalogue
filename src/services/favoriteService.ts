import api from './api';
import {
  FavoriteListResponse,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  FavoriteCountResponse,
  CheckFavoriteResponse,
  FavoriteSearchParams,
} from '@/types/favorite';

export const favoriteService = {
  // Get all favorites with pagination and search
  getFavorites: async (params: FavoriteSearchParams = {}): Promise<FavoriteListResponse> => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        makeId = '',
        categoryId = '',
        status = '',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        makeId: makeId.toString(),
        categoryId: categoryId.toString(),
        status,
      });

      const response = await api.get(`/user/favoriteproduct?${queryParams.toString()}`);
      const apiData = response.data.data || response.data;
      return apiData;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch favorites';

      throw new Error(errorMessage);
    }
  },

  // Add product to favorites
  addToFavorites: async (productId: number): Promise<AddFavoriteResponse> => {
    try {
      const response = await api.post('/user/favoriteproduct', { productId });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to add to favorites';

      throw new Error(errorMessage);
    }
  },

  // Remove product from favorites
  removeFromFavorites: async (productId: number): Promise<RemoveFavoriteResponse> => {
    try {
      const response = await api.delete(`/user/favoriteproduct/${productId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to remove from favorites';

      throw new Error(errorMessage);
    }
  },

  // Check if product is favorite
  checkIsFavorite: async (productId: number): Promise<CheckFavoriteResponse> => {
    try {
      const response = await api.get(`/user/favoriteproduct/check/${productId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to check favorite status';

      throw new Error(errorMessage);
    }
  },

  // Get favorite count
  getFavoriteCount: async (): Promise<FavoriteCountResponse> => {
    try {
      const response = await api.get('/user/favoriteproduct/count');
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to get favorite count';

      throw new Error(errorMessage);
    }
  },

  // Bulk remove from favorites
  bulkRemoveFromFavorites: async (productIds: number[]): Promise<RemoveFavoriteResponse> => {
    try {
      const response = await api.post('/user/favoriteproduct/bulk-remove', { productIds });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to remove favorites';

      throw new Error(errorMessage);
    }
  },
};

export default favoriteService;