export interface Enquiry {
    id: number;
    user_id: number;
    product_id: number | null;
    subject: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    remarks: string | null;
    admin_reply: string | null;
    assigned_to: number | null;
    resolved_at: string | null;
    resolved_by: number | null;
    createdAt: string;
    updatedAt: string;
    product?: {
      id: number;
      name: string;
      product_code: string;
      ref_code: string;
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
    };
    assignedAdmin?: {
      id: number;
      name: string;
      email: string;
    };
  }
  
  export interface CreateEnquiryData {
    productId?: number | null;
    subject: string;
    message: string;
  }
  
  export interface EnquiryListParams {
    page?: number;
    limit?: number;
    status?: string | string[];
    sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'priority';
    order?: 'ASC' | 'DESC';
  }
  
  export interface EnquiryListResponse {
    data: Enquiry[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  }
  
  export interface EnquiryApiResponse {
    status: 'success' | 'error';
    message: string;
    data: Enquiry | EnquiryListResponse;
  }