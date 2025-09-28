import Link from 'next/link';

export default function DubNavbar() {
  return (
    <nav className="bg-black p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/login" className="text-white hover:text-gray-300">
            Login
          </Link>
        </li>
        <li>
          <Link href="/dub/pricing" className="text-white hover:text-gray-300">
            Pricing
          </Link>
        </li>
      </ul>
    </nav>
  );
}