'use client';

import Link from 'next/link';
import Logout from '../Logout';
import DubNav from '../dub/DubNav';
import ChartNav from '../charts/ChartNav';
import SocialNav from '../SocialNav';
import BloxDPSNav from '../dps-comparator/BloxDPSNav';
import TimeOffNav from '../time-off/TimeOffNav';
import DubDropdown from './DubDropdown';
import ChartDropdown from './ChartDropdown';
import BloxDPSDropdown from './BloxDPSDropdown';
import TimeOffDropdown from './TimeOffDropdown';

interface NavigationLinksProps {
  isMobile: boolean;
  userInfo?: any;
  pathname?: string;
  isDubRoute: boolean;
  isChartsRoute: boolean;
  isSocialRoute: boolean;
  isDPSComparatorRoute: boolean;
  isTimeOffRoute: boolean;
}

export default function NavigationLinks({
  isMobile,
  userInfo,
  pathname,
  isDubRoute,
  isChartsRoute,
  isSocialRoute,
  isDPSComparatorRoute,
  isTimeOffRoute,
}: NavigationLinksProps) {
  return (
    <>
      <li>
        <Link
          href="/"
          className="text-white hover:text-gray-300 block py-2 md:py-0"
        >
          All apps
        </Link>
      </li>

      {isMobile ? (
        <>
          {isDubRoute ? <DubNav userInfo={userInfo} /> : null}
          {isChartsRoute ? <ChartNav userInfo={userInfo} /> : null}
          {isSocialRoute ? <SocialNav /> : null}
          {isDPSComparatorRoute ? <BloxDPSNav userInfo={userInfo} /> : null}
          {isTimeOffRoute ? <TimeOffNav userInfo={userInfo} /> : null}
        </>
      ) : (
        <>
          {isDubRoute ? (
            <DubDropdown userInfo={userInfo} pathname={pathname} />
          ) : null}
          {isChartsRoute ? (
            <ChartDropdown userInfo={userInfo} pathname={pathname} />
          ) : null}
          {isSocialRoute ? <SocialNav /> : null}
          {isDPSComparatorRoute ? (
            <BloxDPSDropdown userInfo={userInfo} pathname={pathname} />
          ) : null}
          {isTimeOffRoute ? (
            <TimeOffDropdown userInfo={userInfo} pathname={pathname} />
          ) : null}
        </>
      )}

      {/* Default navigation for all routes */}
      {!userInfo?.name ? (
        <>
          <li>
            <Link
              href="/signup"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Sign Up
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="text-white hover:text-gray-300 block py-2 md:py-0"
            >
              Login
            </Link>
          </li>
        </>
      ) : (
        <li className="block py-2 md:py-0">
          <Logout />
        </li>
      )}
      <li>
        <Link
          href="/contact"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 block"
        >
          Contact Me
        </Link>
      </li>
    </>
  );
}
