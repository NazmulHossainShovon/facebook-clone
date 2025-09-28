import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-black p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/signup" className="text-white hover:text-gray-300">
            Sign Up
          </Link>
        </li>
        <li>
          <Link href="/login" className="text-white hover:text-gray-300">
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}