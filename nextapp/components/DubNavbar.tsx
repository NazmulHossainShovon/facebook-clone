'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { Store } from '../app/lib/store';
import { useRouter } from 'next/navigation';
import { handleLogout } from '../app/utils/logout';

export default function DubNavbar() {
  const {
    state: { userInfo },
    dispatch,
  } = useContext(Store);
  const router = useRouter();

  return (
    <nav className="bg-black p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-white hover:text-gray-300">
            All apps
          </Link>
        </li>
        {userInfo?.name ? (
          <li>
            <button
              onClick={() => handleLogout(dispatch, router)}
              className="text-white hover:text-gray-300 cursor-pointer"
            >
              Logout
            </button>
          </li>
        ) : (
          <li>
            <Link href="/login" className="text-white hover:text-gray-300">
              Login
            </Link>
          </li>
        )}
        <li>
          <Link href="/dub" className="text-white hover:text-gray-300">
            Intro
          </Link>
        </li>
        <li>
          <Link href="/dub/pricing" className="text-white hover:text-gray-300">
            Pricing
          </Link>
        </li>
      </ul>
    </nav>
  );
}
