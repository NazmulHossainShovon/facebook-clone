'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logout from '../Logout';
import DubNav from '../dub/DubNav';
import ChartNav from '../charts/ChartNav';
import SocialNav from '../SocialNav';
import BloxDPSNav from '../dps-comparator/BloxDPSNav';
import TimeOffNav from '../time-off/TimeOffNav';

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
  // Dropdown components for desktop
  const DubDropdown = ({ userInfo }: { userInfo?: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
      setIsOpen(false);
    }, [pathname]);
    return (
      <li className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-gray-300"
        >
          Dub
        </button>
        {isOpen && (
          <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
            <li>
              <Link
                href="/dub"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Intro
              </Link>
            </li>
            <li>
              <Link
                href="/dub/pricing"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
            </li>
            {userInfo?.name && (
              <li>
                <Link
                  href="/dub/account"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Account
                </Link>
              </li>
            )}
          </ul>
        )}
      </li>
    );
  };

  const ChartDropdown = ({ userInfo }: { userInfo?: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
      setIsOpen(false);
    }, [pathname]);
    return (
      <li className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-gray-300"
        >
          Charts
        </button>
        {isOpen && (
          <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
            <li>
              <Link
                href="/charts"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/charts/chart-app"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Create Chart
              </Link>
            </li>
            <li>
              <Link
                href="/charts/pricing"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
            </li>
            {userInfo?.name && (
              <li>
                <Link
                  href="/charts/account"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Account
                </Link>
              </li>
            )}
          </ul>
        )}
      </li>
    );
  };

  const BloxDPSDropdown = ({ userInfo }: { userInfo?: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
      setIsOpen(false);
    }, [pathname]);
    return (
      <li className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-gray-300"
        >
          DPS Comparator
        </button>
        {isOpen && (
          <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
            <li>
              <Link
                href="/dps-comparator"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/dps-comparator/app"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Compare DPS
              </Link>
            </li>
            <li>
              <Link
                href="/dps-comparator/pricing"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
            </li>
            {userInfo?.name && (
              <li>
                <Link
                  href="/dps-comparator/account"
                  className="block px-4 py-2 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Account
                </Link>
              </li>
            )}
          </ul>
        )}
      </li>
    );
  };

  const TimeOffDropdown = ({ userInfo }: { userInfo?: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
      setIsOpen(false);
    }, [pathname]);
    return (
      <li className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-gray-300"
        >
          Time Off Simulator
        </button>
        {isOpen && (
          <ul className="absolute top-full left-0 bg-black text-white mt-1 rounded shadow-lg z-50">
            <li>
              <Link
                href="/time-off-simulator"
                className="block px-4 py-2 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            {userInfo?.name && (
              <>
                <li>
                  <Link
                    href="/time-off-simulator/app"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Submit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/time-off-simulator/app/add-team"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Add Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="/time-off-simulator/app/add-member"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Add Member
                  </Link>
                </li>
                <li>
                  <Link
                    href="/time-off-simulator/app/team-coverage"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Team Coverage
                  </Link>
                </li>
                <li>
                  <Link
                    href="/time-off-simulator/account"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Account
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}
      </li>
    );
  };

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
          {isDubRoute ? <DubDropdown userInfo={userInfo} /> : null}
          {isChartsRoute ? <ChartDropdown userInfo={userInfo} /> : null}
          {isSocialRoute ? <SocialNav /> : null}
          {isDPSComparatorRoute ? (
            <BloxDPSDropdown userInfo={userInfo} />
          ) : null}
          {isTimeOffRoute ? <TimeOffDropdown userInfo={userInfo} /> : null}
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
