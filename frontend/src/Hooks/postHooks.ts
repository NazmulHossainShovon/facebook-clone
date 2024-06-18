import { useMutation } from '@tanstack/react-query';
import apiClient from '../ApiClient';

const useCreatePost = () => {
  return useMutation({
    mutationFn: async ({ post }: { post: string }) => {
      const res = await apiClient.post('/api/posts/create', {
        post,
      });
      return res.data;
    },
  });
};

export { useCreatePost };
