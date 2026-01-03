'use client';

import Dropdown from './Dropdown';

interface BloxDPSDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function BloxDPSDropdown({
  userInfo,
  pathname,
}: BloxDPSDropdownProps) {
  const links = [
    { href: '/dps-comparator', text: 'Home' },
    { href: '/dps-comparator/app', text: 'Compare DPS' },
    { href: '/dps-comparator/pricing', text: 'Pricing' },
    {
      href: '/dps-comparator/account',
      text: 'Account',
      condition: !!userInfo?.name,
    },
  ];

  return (
    <Dropdown
      title="DPS Comparator"
      links={links}
      userInfo={userInfo}
      pathname={pathname}
    />
  );
}
