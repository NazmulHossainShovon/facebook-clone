'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/segment/sources', label: 'Sources' },
  { href: '/segment/destinations', label: 'Destinations' },
  { href: '/segment/events', label: 'Live Events' },
];

export default function SegmentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4 md:min-h-[calc(100vh-56px)]">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Segment MVP</h2>
      <nav className="space-y-2">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
