import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface DubRequest {
  youtubeUrl: string;
}

interface DubResponse {
  message: string;
  success: boolean;
  data?: {
    youtubeUrl: string;
    videoId: string;
    videoInfo: {
      title: string;
      thumbnail: string;
      duration: string;
    };
  };
}

export const useProcessYoutubeUrl = () => {
  return useMutation<DubResponse, Error, DubRequest>({
    mutationFn: async (data: DubRequest) => {
      const response = await apiClient.post<DubResponse>('/api/dub', data);
      return response.data;
    },
  });
};