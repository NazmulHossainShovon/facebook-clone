'use client';

import Dropdown from './Dropdown';

interface ChartDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function ChartDropdown({
  userInfo,
  pathname,
}: ChartDropdownProps) {
  const links = [
    { href: '/charts', text: 'Home' },
    { href: '/charts/chart-app', text: 'Create Chart' },
    { href: '/charts/pricing', text: 'Pricing' },
    { href: '/charts/account', text: 'Account', condition: !!userInfo?.name },
  ];

  return (
    <Dropdown
      title="Charts"
      links={links}
      userInfo={userInfo}
      pathname={pathname}
    />
  );
}
