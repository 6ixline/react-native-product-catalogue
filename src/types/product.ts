export interface Product {
    id: number;
    make_id: number;
    category_id: number;
    name: string;
    product_code: string;
    ref_code: string;
    color: string;
    mrp: string;
    std_pkg: string;
    mast_pkg: string;
    lumax_part_no: string;
    varroc_part_no: string;
    butter_size: string;
    pt_bc: string;
    pt_tc: string;
    shell_name: string;
    ic_box_size: string;
    mc_box_size: string;
    graphic: string;
    varroc_mrp: string;
    lumax_mrp: string | null;
    visor_glass: string;
    status: string;
    created_by: number;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
    make: {
      id: number;
      title: string;
      slug: string;
    };
    category: {
      id: number;
      title: string;
      slug: string;
    };
    creator: {
      id: number;
      username: string;
      displayName: string;
    };
    thumbnail: string | null;
  }
  
  export interface ProductDetail extends Product {
    updater: {
      id: number;
      username: string;
      displayName: string;
    };
    images: ProductImage[];
    relatedProducts: RelatedProduct[];
  }
  
  export interface ProductImage {
    id: number;
    url: string;
    isPrimary?: boolean;
  }
  
  export interface RelatedProduct {
    id: number;
    name: string;
    product_code: string;
    color: string;
    mrp: string;
    status: string;
    thumbnail?: string | null;
    make: {
      title: string;
    };
    category: {
      title: string;
    };
  }
  
  export interface ProductSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    makeId?: number | string;
    categoryId?: number | string;
    status?: string;
    refCode?: string;
  }
  
  export interface ProductListResponse {
    data: Product[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  }
  
  export interface ProductApiResponse {
    success: boolean;
    message: string;
    data: ProductListResponse;
  }
  
  export interface ProductDetailResponse {
    success: boolean;
    message: string;
    data: ProductDetail;
  }