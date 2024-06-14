import React, { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { User } from '../Types/types';

export default function useFindUser() {
  const { dispatch } = useContext(Store);
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    const localUser = localStorage.getItem('user-info');

    if (localUser) {
      dispatch({ type: 'sign-in', payload: JSON.parse(localUser) });
      setUser(JSON.parse(localUser));
    }
  }, [dispatch]);

  //   return user;
}
