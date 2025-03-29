import React, { useContext } from 'react';
import Input from '../Components/Input';
import { Button } from '../Components/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSigninMutation } from '../Hooks/userHook';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const { mutateAsync: signin, isPending } = useSigninMutation();
  const { dispatch } = useContext(Store);
  const navigate = useNavigate();

  const formDataHandle: SubmitHandler<FormData> = async (data: {
    email: string;
    password: string;
  }) => {
    const res = await signin(data);
    dispatch({ type: 'sign-in', payload: res.user });
    localStorage.setItem('user-token', res.token);
    navigate('/');
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
          register={() => register('email')}
          type="email"
          placeholder="Email"
        />
        <Input
          register={() => register('password')}
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
    </div>
  );
}
