'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LinkItem {
  href: string;
  text: string;
  condition?: boolean;
}

interface DropdownProps {
  title: string;
  links: LinkItem[];
  userInfo?: any;
  pathname?: string;
}

export default function Dropdown({
  title,
  links,
  userInfo,
  pathname,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const filteredLinks = links.filter(
    link => link.condition === undefined || link.condition
  );

  return (
    <li className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gray-300"
      >
        {title}
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
          {filteredLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
