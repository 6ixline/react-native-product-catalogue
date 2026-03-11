import api from './api';
import { Product, ProductDetail, ProductSearchParams, ProductListResponse } from '@/types/product';

export const productService = {
  searchProducts: async (params: ProductSearchParams = {}): Promise<ProductListResponse> => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        makeId = '',
        categoryId = '',
        status = '',
        refCode = '',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        makeId: makeId.toString(),
        categoryId: categoryId.toString(),
        status,
        refCode,
      });

      const response = await api.get(`/admin/catalog/products?${queryParams.toString()}`);
      
      const apiData = response.data.data || response.data;
      return apiData;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch products';
      
      throw new Error(errorMessage);
    }
  },

  getProductById: async (id: number): Promise<ProductDetail> => {
    try {
      const response = await api.get(`/admin/catalog/products/${id}`);
      const apiData = response.data.data || response.data;
      return apiData;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        'Failed to fetch product details';
      
      throw new Error(errorMessage);
    }
  },

  getProductsByRefCode: async (refCode: string): Promise<Product[]> => {
    try {
      const response = await productService.searchProducts({ refCode, limit: 100 });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch related products');
    }
  },
};