import { useMutation } from '@tanstack/react-query';
import { SignupData, User } from '../Types/types';
import apiClient from '../ApiClient';

export const useSignupMutation = () =>
  useMutation({
    mutationFn: async (userInfo: SignupData) => {
      const res = await apiClient.post<User>('api/users/signup', userInfo);
      return res.data;
    },
  });
