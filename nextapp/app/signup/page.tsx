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
        {isPending && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}
      </form>
    </div>
  );
}
