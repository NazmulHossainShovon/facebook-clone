'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Store } from '../app/lib/store';
import Logout from './Logout';
import DubNav from './dub/DubNav';

export default function RootNav() {
  const {
    state: { userInfo },
  } = useContext(Store);
  const pathname = usePathname();
  
  // Check if we're on a dub route
  const isDubRoute = pathname?.startsWith('/dub');
  
  // Determine nav classes based on route
  const navClasses = isDubRoute 
    ? "bg-black p-4 fixed top-0 left-0 right-0 z-50"
    : "bg-black p-4";

  return (
    <nav className={navClasses}>
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-white hover:text-gray-300">
            All apps
          </Link>
        </li>
        
        {isDubRoute ? (
          <DubNav />
        ) : (
          // Default navigation
          <>
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
              <Link
                href="/terms-and-conditions"
                className="text-white hover:text-gray-300"
              >
                Terms
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
