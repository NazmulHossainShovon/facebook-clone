'use client';

import Link from 'next/link';

export default function DubNav() {
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
      <li>
        <Link href="/dub/account" className="text-white hover:text-gray-300">
          Account
        </Link>
      </li>
    </>
  );
}