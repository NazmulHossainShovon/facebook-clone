import React from 'react';
import Input from '../Components/Input';
import { Button } from '../Components/Button';
import { SubmitHandler, useForm } from 'react-hook-form';

export default function Signup() {
  const { register, handleSubmit } = useForm();

  const formDataHandle: SubmitHandler = data => {
    console.log(data);
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
