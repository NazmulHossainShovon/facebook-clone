'use client';

import { useContext, useEffect } from 'react';
import { Store } from '../lib/store';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const {
    state: { userInfo },
  } = useContext(Store);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('user-info')) {
        router.push('/login');
      }
    }
  }, [userInfo, router]);

  if (userInfo?.name) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
