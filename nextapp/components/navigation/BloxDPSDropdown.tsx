'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BloxDPSDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function BloxDPSDropdown({
  userInfo,
  pathname,
}: BloxDPSDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  return (
    <li className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gray-300"
      >
        DPS Comparator
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
          <li>
            <Link
              href="/dps-comparator"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/dps-comparator/app"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Compare DPS
            </Link>
          </li>
          <li>
            <Link
              href="/dps-comparator/pricing"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
          </li>
          {userInfo?.name && (
            <li>
              <Link
                href="/dps-comparator/account"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}
