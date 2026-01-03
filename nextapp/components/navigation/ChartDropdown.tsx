'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ChartDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function ChartDropdown({
  userInfo,
  pathname,
}: ChartDropdownProps) {
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
        Charts
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
          <li>
            <Link
              href="/charts"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/charts/chart-app"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Create Chart
            </Link>
          </li>
          <li>
            <Link
              href="/charts/pricing"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
          </li>
          {userInfo?.name && (
            <li>
              <Link
                href="/charts/account"
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
