import React, { useContext } from 'react';
import Input from '../Components/Input';
import { Button } from '../Components/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSignupMutation } from '../Hooks/userHook';
import { SignupData } from '../Types/types';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, LinearProgress } from '@mui/material';

const uploadToSirv = async (file: File, userName: string) => {
  const clientId = import.meta.env.VITE_SIRV_ID;
  const clientSecret = import.meta.env.VITE_SIRV_SECRET;

  // Get Sirv access token
  const tokenResponse = await axios.post('https://api.sirv.com/v2/token', {
    clientId,
    clientSecret,
  });

  const { token } = tokenResponse.data;

  const uploadResponse = await axios.post(
    `https://api.sirv.com/v2/files/upload?filename=%2Ffacebook%2F${userName}.png`,
    file,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/png',
      },
    }
  );
  return uploadResponse.data;
};

export default function Signup() {
  const { register, handleSubmit } = useForm<SignupData>();
  const { mutateAsync: signup, isPending } = useSignupMutation();
  const { dispatch } = useContext(Store);
  const navigate = useNavigate();

  const formDataHandle: SubmitHandler<SignupData> = async (
    data: SignupData
  ) => {
    const imageFile = data.image[0];

    if (imageFile) {
      await uploadToSirv(imageFile, data.name);
    }

    const res = await signup({
      name: data.name,
      email: data.email,
      password: data.password,
      image: `https://nazmul.sirv.com/facebook/${data.name}.png`,
    });
    dispatch({ type: 'sign-in', payload: res });
    localStorage.setItem('user-info', JSON.stringify(res));
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-5 pt-8 items-center">
      <h1>Signup</h1>
      <form
        onSubmit={handleSubmit(formDataHandle)}
        className="flex flex-col gap-3 items-center"
      >
        <Input register={() => register('name')} placeholder="Name" />
        <Input
          register={() => register('email')}
          type="email"
          placeholder="Email"
        />
        <Input
          register={() => register('password')}
          type="password"
          placeholder="Password"
        />
        <div className=" flex flex-col gap-1">
          <label htmlFor="image">Profile Image</label>
          <input id="image" {...register('image')} type="file" />
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
