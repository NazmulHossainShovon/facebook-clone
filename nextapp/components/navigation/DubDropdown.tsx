'use client';

import Dropdown from './Dropdown';

interface DubDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function DubDropdown({ userInfo, pathname }: DubDropdownProps) {
  const links = [
    { href: '/dub', text: 'Intro' },
    { href: '/dub/pricing', text: 'Pricing' },
    { href: '/dub/account', text: 'Account', condition: !!userInfo?.name },
  ];

  return (
    <Dropdown
      title="Dub"
      links={links}
      userInfo={userInfo}
      pathname={pathname}
    />
  );
}
