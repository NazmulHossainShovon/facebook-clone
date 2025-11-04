'use client';

import Link from 'next/link';

interface UserInfo {
  name?: string;
}

interface ChartNavProps {
  userInfo?: UserInfo;
}

export default function ChartNav({ userInfo }: ChartNavProps) {
  return (
    <>
      <li>
        <Link href="/charts" className="text-white hover:text-gray-300">
          Home
        </Link>
      </li>
      <li>
        <Link href="/charts/chart-app" className="text-white hover:text-gray-300">
          Create Chart
        </Link>
      </li>
      {userInfo?.name && (
        <li>
          <Link href="/charts/account" className="text-white hover:text-gray-300">
            Account
          </Link>
        </li>
      )}
    </>
  );
}