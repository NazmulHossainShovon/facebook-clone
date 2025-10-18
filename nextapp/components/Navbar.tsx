'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { Store } from '../app/lib/store';
import { handleLogout } from '../app/utils/logout';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { state: { userInfo }, dispatch } = useContext(Store);
  const router = useRouter();

  const handleUserLogout = () => {
    handleLogout(dispatch, router);
  };

  return (
    <nav className="bg-black p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-white hover:text-gray-300">
            All apps
          </Link>
        </li>
        {!userInfo?.name ? (
          <>
            <li>
              <Link href="/signup" className="text-white hover:text-gray-300">
                Sign Up
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-white hover:text-gray-300">
                Login
              </Link>
            </li>
          </>
        ) : (
          <li>
            <button 
              onClick={handleUserLogout}
              className="text-white hover:text-gray-300 cursor-pointer"
            >
              Logout
            </button>
          </li>
        )}
        <li>
          <Link href="/terms-and-conditions" className="text-white hover:text-gray-300">
            Terms
          </Link>
        </li>
      </ul>
    </nav>
  );
}