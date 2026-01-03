'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TimeOffDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function TimeOffDropdown({
  userInfo,
  pathname,
}: TimeOffDropdownProps) {
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
        Time Off Simulator
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
          <li>
            <Link
              href="/time-off-simulator"
              className="block px-4 py-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          {userInfo?.name && (
            <>
              <li>
                <Link
                  href="/time-off-simulator/app"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Submit
                </Link>
              </li>
              <li>
                <Link
                  href="/time-off-simulator/app/add-team"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Add Team
                </Link>
              </li>
              <li>
                <Link
                  href="/time-off-simulator/app/add-member"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Add Member
                </Link>
              </li>
              <li>
                <Link
                  href="/time-off-simulator/app/team-coverage"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Team Coverage
                </Link>
              </li>
              <li>
                <Link
                  href="/time-off-simulator/account"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Account
                </Link>
              </li>
            </>
          )}
        </ul>
      )}
    </li>
  );
}
