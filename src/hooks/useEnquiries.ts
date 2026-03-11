import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enquiryService } from '@/services/enquiryService';
import { CreateEnquiryData, EnquiryListParams } from '@/types/enquiry';
import Toast from 'react-native-toast-message';

/**
 * Hook to create a new enquiry
 */
export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEnquiryData) => enquiryService.createEnquiry(data),
    onSuccess: () => {
      // Invalidate enquiries list to refetch
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to Submit',
        text2: error.message || 'Failed to create enquiry',
        position: 'top',
        visibilityTime: 3000,
      });
    },
  });
}

/**
 * Hook to get user's enquiries
 */
export function useUserEnquiries(params: EnquiryListParams = {}) {
  return useQuery({
    queryKey: ['enquiries', params],
    queryFn: () => enquiryService.getUserEnquiries(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true,
  });
}

/**
 * Hook to get a single enquiry by ID
 */
export function useEnquiryDetail(id: number) {
  return useQuery({
    queryKey: ['enquiry-detail', id],
    queryFn: () => enquiryService.getEnquiryById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}