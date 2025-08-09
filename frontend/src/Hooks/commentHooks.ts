import { useMutation } from '@tanstack/react-query';
import apiClient from '../ApiClient';

// Creates a new comment for a post using the backend /api/comments endpoint
// Backend expects: { postId: string, content: string }
const useCreateComment = () => {
  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const res = await apiClient.post('/api/comments', {
        postId,
        content,
      });
      return res.data;
    },
  });
};

export { useCreateComment };
