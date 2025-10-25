import RootNav from 'components/RootNav';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="">
      <RootNav />
      <h1 className="text-3xl font-bold mb-8 text-center">All Apps</h1>
      <p className="text-center mb-12">Welcome to our apps!</p>

      <div className="flex flex-col items-center space-y-6">
        <Link
          href="/social"
          className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          Social
        </Link>
        <Link
          href="/dub"
          className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          Dubbing
        </Link>
      </div>
    </div>
  );
}
