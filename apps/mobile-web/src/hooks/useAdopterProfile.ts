import { AdopterProfileFormDataType } from '@/components/forms/adopterProfile/model';
import { apiRequest } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useAdopterProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdopterProfileFormDataType) => {
      return apiRequest('/adopter-profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adopter-profile'] }),
  });
};