'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { Store } from '../app/lib/store';
import Logout from './Logout';

export default function Navbar() {
  const { state: { userInfo } } = useContext(Store);

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
            <Logout />
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