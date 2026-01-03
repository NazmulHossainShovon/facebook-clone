'use client';

import Dropdown from './Dropdown';

interface TimeOffDropdownProps {
  userInfo?: any;
  pathname?: string;
}

export default function TimeOffDropdown({
  userInfo,
  pathname,
}: TimeOffDropdownProps) {
  const links = [
    { href: '/time-off-simulator', text: 'Home' },
    {
      href: '/time-off-simulator/app',
      text: 'Submit',
      condition: !!userInfo?.name,
    },
    {
      href: '/time-off-simulator/app/add-team',
      text: 'Add Team',
      condition: !!userInfo?.name,
    },
    {
      href: '/time-off-simulator/app/add-member',
      text: 'Add Member',
      condition: !!userInfo?.name,
    },
    {
      href: '/time-off-simulator/app/team-coverage',
      text: 'Team Coverage',
      condition: !!userInfo?.name,
    },
    {
      href: '/time-off-simulator/account',
      text: 'Account',
      condition: !!userInfo?.name,
    },
  ];

  return (
    <Dropdown
      title="Time Off Simulator"
      links={links}
      userInfo={userInfo}
      pathname={pathname}
    />
  );
}
