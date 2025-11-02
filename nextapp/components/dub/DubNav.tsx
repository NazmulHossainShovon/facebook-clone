'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { Store } from '../../app/lib/store';
import Logout from '../Logout';

export default function DubNav() {
  const {
    state: { userInfo },
  } = useContext(Store);

  return (
    <>
      {userInfo?.name ? (
        <>
          <li>
            <Logout />
          </li>
          <li>
            <Link href="/dub/account" className="text-white hover:text-gray-300">
              Account
            </Link>
          </li>
        </>
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
    </>
  );
}