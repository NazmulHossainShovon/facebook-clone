'use client';

import React, { useContext } from 'react';
import Input from '@/components/Input';
import { Button } from '@/components/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSigninMutation } from '@/hooks/user-hooks';
import { Store } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Box, LinearProgress } from '@mui/material';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const { mutateAsync: signin, isPending } = useSigninMutation();
  const { dispatch } = useContext(Store);
  const router = useRouter();
  const { toast } = useToast();

  const formDataHandle: SubmitHandler<FormData> = async (data: {
    email: string;
    password: string;
  }) => {
    try {
      const res = await signin(data);
      dispatch({ type: 'sign-in', payload: res.user });
      localStorage.setItem('user-token', res.token);
      router.push('/');
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({
        title: err.response?.data.message,
      });
    }
  };

  const handleDummyAccount = () => {
    setValue('email', 'maria@gmail.com');
    setValue('password', 'maria');
  };

  return (
    <div className="flex flex-col gap-5 mt-16 items-center">
      <Button onClick={handleDummyAccount}>Use dummy account</Button>
      <h2>Login</h2>
      <form
        onSubmit={handleSubmit(formDataHandle)}
        className="flex flex-col gap-3 items-center"
      >
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
        />
        <Input
          {...register('password')}
          type="password"
          placeholder="Password"
        />
        <Button>Login</Button>
        {isPending && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}
      </form>
      <Toaster />
    </div>
  );
}
