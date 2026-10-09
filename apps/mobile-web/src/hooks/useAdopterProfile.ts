import { AdopterProfileFormDataType } from '@/components/forms/adopterProfile/model';
import { apiRequest, ApiError } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { AdopterProfile } from '@kapa/shared';

export const useAdopterProfile = () => {
  const queryClient = useQueryClient();
  const { setHasAdopterProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: AdopterProfileFormDataType) => {
      return apiRequest<AdopterProfile>('/adopter-profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      void setHasAdopterProfile(true);
      queryClient.setQueryData(['adopter-profile', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['adopter-profile'] });
    },
  });
};

export const useAdopterProfileMe = (enabled = true) => {
  return useQuery({
    queryKey: ['adopter-profile', 'me'],
    queryFn: async () => {
      try {
        return await apiRequest<AdopterProfile>('/adopter-profiles/me');
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};