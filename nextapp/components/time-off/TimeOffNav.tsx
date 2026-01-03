'use client';

import Link from 'next/link';

interface UserInfo {
  name?: string;
}

interface TimeOffNavProps {
  userInfo?: UserInfo;
}

export default function TimeOffNav({ userInfo }: TimeOffNavProps) {
  return (
    <>
      <li>
        <Link
          href="/time-off-simulator"
          className="text-white hover:text-gray-300 block py-2 md:py-0"
        >
          Home
        </Link>
      </li>
      {userInfo?.name && (
        <>
          <li>
            <Link
              href="/time-off-simulator/app"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Submit
            </Link>
          </li>
          <li>
            <Link
              href="/time-off-simulator/app/add-team"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Add Team
            </Link>
          </li>
          <li>
            <Link
              href="/time-off-simulator/app/add-member"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Add Member
            </Link>
          </li>
          <li>
            <Link
              href="/time-off-simulator/app/team-coverage"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Team Coverage
            </Link>
          </li>
          <li>
            <Link
              href="/time-off-simulator/account"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Account
            </Link>
          </li>
        </>
      )}
    </>
  );
}
