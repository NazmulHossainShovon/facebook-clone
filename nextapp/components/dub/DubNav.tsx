'use client';

import Link from 'next/link';

interface UserInfo {
  name?: string;
}

interface DubNavProps {
  userInfo?: UserInfo;
}

export default function DubNav({ userInfo }: DubNavProps) {
  return (
    <>
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
      {userInfo?.name && (
        <li>
          <Link href="/dub/account" className="text-white hover:text-gray-300">
            Account
          </Link>
        </li>
      )}
    </>
  );
}