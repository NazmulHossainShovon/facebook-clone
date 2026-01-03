'use client';

import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Store } from '../app/lib/store';
import Logout from './Logout';
import DubNav from './dub/DubNav';
import ChartNav from './charts/ChartNav';
import SocialNav from './SocialNav';
import BloxDPSNav from './dps-comparator/BloxDPSNav';
import TimeOffNav from './time-off/TimeOffNav';

export default function RootNav() {
  const {
    state: { userInfo },
  } = useContext(Store);
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check if we're on a dub route
  const isDubRoute = pathname?.startsWith('/dub');
  // Check if we're on a charts route
  const isChartsRoute = pathname?.startsWith('/charts');
  // Check if we're on a social route
  const isSocialRoute = pathname?.startsWith('/social');
  // Check if we're on a dps-comparator route
  const isDPSComparatorRoute = pathname?.startsWith('/dps-comparator');
  // Check if we're on a time-off-simulator route
  const isTimeOffRoute = pathname?.startsWith('/time-off-simulator');

  // Close drawer when route changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

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

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const drawer = document.getElementById('mobile-drawer');
      const hamburger = document.getElementById('hamburger-button');

      if (
        isDrawerOpen &&
        drawer &&
        hamburger &&
        !drawer.contains(event.target as Node) &&
        !hamburger.contains(event.target as Node)
      ) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const NavigationLinks = ({ isMobile }: { isMobile: boolean }) => (
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

  return (
    <>
      <nav className="bg-black p-4 fixed top-0 left-0 right-0 z-50">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-4 items-center">
          <NavigationLinks isMobile={false} />
        </ul>

        {/* Mobile Navigation - Hamburger Button */}
        <div className="md:hidden flex justify-between items-center">
          <button
            id="hamburger-button"
            onClick={toggleDrawer}
            className="text-white hover:text-gray-300 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isDrawerOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Drawer */}
        <div
          id="mobile-drawer"
          className={`absolute top-0 left-0 h-full w-64 bg-black transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 pt-20">
            <ul className="space-y-2">
              <NavigationLinks isMobile={true} />
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
