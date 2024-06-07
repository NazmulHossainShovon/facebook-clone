import React, { useContext } from 'react';
import Input from '../Components/Input';
import { Button } from '../Components/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSignupMutation } from '../Hooks/userHook';
import { SignupData, User } from '../Types/types';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { register, handleSubmit } = useForm();
  const { mutateAsync: signup } = useSignupMutation();
  const { dispatch } = useContext(Store);
  const navigate = useNavigate();

  const formDataHandle: SubmitHandler = async (data: SignupData) => {
    const res = await signup(data);
    dispatch({ type: 'sign-in', payload: res });
    localStorage.setItem('user-info', JSON.stringify(res));
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-5 items-center">
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
        <Button>Signup</Button>
      </form>
    </div>
  );
}
