import { useMutation, useQuery } from '@tanstack/react-query';
import { People, User } from '../Types/types';
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

export const useGetUserInfo = (userName: string) =>
  useQuery({
    queryKey: ['user', userName],
    queryFn: async () => {
      const res = await apiClient.get<User>('api/users', {
        params: { userName },
      });
      return res.data;
    },
  });

export const useSearchUsers = (query: string) =>
  useQuery({
    queryKey: [query],
    queryFn: async () => {
      const res = await apiClient.get<People[]>('api/search', {
        params: { query },
      });
      return res.data;
    },
  });
