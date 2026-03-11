import { Product } from './product';

export interface FavoriteProduct {
  id: number;
  user_id: number;
  product_id: number;
  createdAt: string;
  updatedAt: string;
  product: Product & {
    isFavorite: boolean;
  };
}

export interface FavoriteListResponse {
  data: FavoriteProduct[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface FavoriteApiResponse {
  success: boolean;
  message: string;
  data: FavoriteListResponse;
}

export interface AddFavoriteResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    product_id: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RemoveFavoriteResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    product_id: number;
  };
}

export interface FavoriteCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export interface CheckFavoriteResponse {
  success: boolean;
  message: string;
  data: {
    isFavorite: boolean;
  };
}

export interface FavoriteSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  makeId?: number | string;
  categoryId?: number | string;
  status?: string;
}