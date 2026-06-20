'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SegmentSidebar from '../../../components/segment/SegmentSidebar';

type SegmentUser = {
  email: string;
};

export default function SegmentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<SegmentUser | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem('segment-token') || localStorage.getItem('user-token');
    const storedUser =
      localStorage.getItem('segment-user') || localStorage.getItem('user-info');

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    }

    setHydrated(true);
  }, [router, pathname]);

  const email = useMemo(() => user?.email || 'segment-user', [user]);

  const handleLogout = () => {
    localStorage.removeItem('segment-token');
    localStorage.removeItem('segment-user');
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-info');
    router.push('/login');
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 border-b border-gray-200 bg-white px-4 md:px-6 flex items-center justify-between">
        <p className="text-sm text-gray-700">{email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-col md:flex-row">
        <SegmentSidebar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
