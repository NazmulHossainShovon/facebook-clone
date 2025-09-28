'use client';

import { useContext } from 'react';
import { Button } from '@/components/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSignupMutation } from '@/hooks/user-hooks';
import { Store } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Box, LinearProgress } from '@mui/material';
import { z } from 'zod';
import FormErrorMessage from '@/components/FormErrorMessage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import Navbar from 'components/Navbar';

import { uploadToS3 } from '@/utils/uploadToS3';
import Input from '../components/Input';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email(),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters' }),
  image: z
    .any()
    .refine(
      files => files?.[0] === undefined || files?.[0].size <= 512000,
      'Max image size is 500KB.'
    ),
});

type SignupFields = z.infer<typeof signupSchema>;

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
  });
  const { mutateAsync: signup, isPending } = useSignupMutation();
  const { dispatch } = useContext(Store);
  const router = useRouter();
  const { toast } = useToast();

  const formDataHandle: SubmitHandler<SignupFields> = async (
    data: SignupFields
  ) => {
    const imageFile = data.image[0];
    let imageUrl = '';
    if (imageFile) {
      imageUrl = await uploadToS3(imageFile, data.name);
    }
    const res = await signup({
      name: data.name,
      email: data.email,
      password: data.password,
      image: imageUrl,
    });
    dispatch({ type: 'sign-in', payload: res.user });
    localStorage.setItem('user-token', res.token);
    if (res.emailSent) {
      toast({
        title: 'A welcome email has been sent to your email address.',
      });
    } else {
      toast({
        title: 'Could not send welcome email. Please check your email address.',
      });
    }
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col gap-5 pt-8 items-center">
        <h1>Signup</h1>
        <form
          onSubmit={handleSubmit(formDataHandle)}
          className="flex flex-col gap-3 items-center"
        >
          <Input {...register('name')} placeholder="Name" />
          {errors?.name?.message && (
            <FormErrorMessage message={errors.name.message} />
          )}
          <Input {...register('email')} type="email" placeholder="Email" />
          <Input
            {...register('password')}
            type="password"
            placeholder="Password"
          />
          {errors?.password?.message && (
            <FormErrorMessage message={errors.password.message} />
          )}
          <div className=" flex flex-col gap-1">
            <label htmlFor="image">Profile Image</label>
            <input id="image" {...register('image')} type="file" />
            {errors.image?.message && (
              <FormErrorMessage message={errors.image.message as string} />
            )}
          </div>

          <Button>Signup</Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => {
              const backendUrl =
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
              window.location.href = `${backendUrl}/api/users/auth/google`;
            }}
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            disabled={isPending}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {isPending && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          )}
        </form>
      </div>
    </>
  );
}
