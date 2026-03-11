import api from './api';
import { 
  Enquiry, 
  CreateEnquiryData, 
  EnquiryListParams, 
  EnquiryListResponse 
} from '@/types/enquiry';

export const enquiryService = {
  /**
   * Create a new enquiry
   */
  createEnquiry: async (data: CreateEnquiryData): Promise<Enquiry> => {
    try {
      const response = await api.post('/user/enquiry', data);
      const apiData = response.data.data || response.data;
      return apiData;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to create enquiry';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all enquiries for the logged-in user
   */
  getUserEnquiries: async (params: EnquiryListParams = {}): Promise<EnquiryListResponse> => {
    try {
      const {
        page = 1,
        limit = 10,
        status = '',
        sortBy = 'createdAt',
        order = 'desc',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (status) {
        if (Array.isArray(status)) {
          queryParams.append('status', status.join(','));
        } else {
          queryParams.append('status', status);
        }
      }

      const response = await api.get(`/user/enquiry?${queryParams.toString()}`);
      const apiData = response.data.data || response.data;
      return apiData;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch enquiries';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get a single enquiry by ID
   */
  getEnquiryById: async (id: number): Promise<Enquiry> => {
    try {
      const response = await api.get(`/user/enquiry/${id}`);
      const apiData = response.data.data || response.data;
      return apiData;
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch enquiry details';
      
      throw new Error(errorMessage);
    }
  },
};