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

const useGetPosts = (userName: string | undefined) => {
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

const useGetFriendPosts = () =>
  useQuery({
    queryKey: ['friendsPosts'],
    queryFn: async () => {
      const res = await apiClient.get<Post[]>('/api/posts/friends');
      return res.data;
    },
  });

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
    mutationFn: async ({
      userName,
      postId,
    }: {
      userName: string;
      postId: string;
    }) => {
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
    mutationFn: async ({
      userName,
      postId,
    }: {
      userName: string;
      postId: string;
    }) => {
      const res = await apiClient.put('/api/posts/unlike', {
        userName,
        postId,
      });
      return res.data;
    },
  });
};

const useCommentPost = () => {
  return useMutation({
    mutationFn: async ({
      userName,
      postId,
      comment,
    }: {
      userName: string;
      postId: string;
      comment: string;
    }) => {
      const res = await apiClient.put<Post>('/api/posts/comment', {
        userName,
        postId,
        comment,
      });
      return res.data;
    },
  });
};

const useDeleteComment = () => {
  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => {
      const res = await apiClient.delete<{ message: string; post: Post }>(
        '/api/posts/comment',
        {
          data: {
            postId,
            commentId,
          },
        }
      );
      return res.data;
    },
  });
};

const useUpdatePost = () => {
  return useMutation({
    mutationFn: async ({ id, post }: { id: string; post: string }) => {
      const res = await apiClient.put<{ message: string; doc: Post }>(
        '/api/posts/update',
        {
          id,
          post,
        }
      );
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
  useGetFriendPosts,
  useCommentPost,
  useDeleteComment,
};
