import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { ProductSearchParams } from '@/types/product';

export function useProducts(params: ProductSearchParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.searchProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true,
  });
}

export function useProductsInfinite(params: Omit<ProductSearchParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      productService.searchProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useProductsByRefCode(refCode: string) {
  return useQuery({
    queryKey: ['products-by-ref', refCode],
    queryFn: () => productService.getProductsByRefCode(refCode),
    enabled: !!refCode,
    staleTime: 1000 * 60 * 10,
  });
}