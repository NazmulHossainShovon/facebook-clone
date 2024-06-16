import { useMutation } from '@tanstack/react-query';
import { User } from '../Types/types';
import apiClient from '../ApiClient';

export const useSignupMutation = () =>
  useMutation({
    mutationFn: async (userInfo: {
      name: string;
      email: string;
      password: string;
      image: string;
    }) => {
      const res = await apiClient.post<User>('api/users/signup', userInfo);
      return res.data;
    },
  });

export const useSigninMutation = () =>
  useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await apiClient.post<User>('api/users/signin', {
        email,
        password,
      });
      return res.data;
    },
  });
