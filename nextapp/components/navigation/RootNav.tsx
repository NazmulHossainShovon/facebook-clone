'use client';

import { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Store } from '../../app/lib/store';
import NavigationLinks from './NavigationLinks';

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

  return (
    <>
      <nav className="bg-black p-4 fixed top-0 left-0 right-0 z-50">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-4 items-center">
          <NavigationLinks
            isMobile={false}
            userInfo={userInfo}
            pathname={pathname}
            isDubRoute={isDubRoute}
            isChartsRoute={isChartsRoute}
            isSocialRoute={isSocialRoute}
            isDPSComparatorRoute={isDPSComparatorRoute}
            isTimeOffRoute={isTimeOffRoute}
          />
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
              <NavigationLinks
                isMobile={true}
                userInfo={userInfo}
                pathname={pathname}
                isDubRoute={isDubRoute}
                isChartsRoute={isChartsRoute}
                isSocialRoute={isSocialRoute}
                isDPSComparatorRoute={isDPSComparatorRoute}
                isTimeOffRoute={isTimeOffRoute}
              />
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
