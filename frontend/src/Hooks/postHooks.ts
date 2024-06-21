import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../ApiClient';
import { Post } from '../Types/types';

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

const useGetPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await apiClient.get<Post[]>('/api/posts');
      return res.data;
    },
  });
};

export { useCreatePost, useGetPosts };
