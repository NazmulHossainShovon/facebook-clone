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

const useGetPosts = (userName: string) => {
  return useQuery({
    queryKey: ['posts', userName],
    queryFn: async () => {
      const res = await apiClient.get<Post[]>('/api/posts', {
        params: { userName },
      });
      return res.data;
    },
  });
};

const useDeletePost = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await apiClient.delete(`/api/posts/delete/${id}`);
      return res.data;
    },
  });
};

const useLikePost = () => {
  return useMutation({
    mutationFn: async ({ userName, postId }) => {
      const res = await apiClient.put<Post>('/api/posts/like', {
        userName,
        postId,
      });
      return res.data;
    },
  });
};

const useUnlikePost = () => {
  return useMutation({
    mutationFn: async ({ userName, postId }) => {
      const res = await apiClient.put('/api/posts/unlike', {
        userName,
        postId,
      });
      return res.data;
    },
  });
};

const useUpdatePost = () => {
  return useMutation({
    mutationFn: async ({ id, post }: { id: string; post: string }) => {
      const res = await apiClient.put('/api/posts/update', {
        id,
        post,
      });
      return res.data;
    },
  });
};

export {
  useCreatePost,
  useGetPosts,
  useDeletePost,
  useLikePost,
  useUnlikePost,
  useUpdatePost,
};
