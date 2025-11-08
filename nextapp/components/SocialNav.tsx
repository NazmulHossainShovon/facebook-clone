'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AvatarMenu from './AvatarMenu';
import { useContext, useState } from 'react';
import { Store } from '../app/lib/store';
import Input from './Input';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import FriendReqsMenu from './FriendReqsMenu';
import { Drawer } from '@mui/material';
import FriendList from './FriendList';

function SocialNav() {
  const {
    state: { userInfo },
  } = useContext(Store);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleSearchQuery = () => {
    router.push(`/search/${searchQuery}`);
  };

  return (
    <div className="flex justify-between md:justify-start text-white items-center gap-5 ">
      {userInfo.name && (
        <>
          <Link href={'/social'}>Home</Link>
          <AvatarMenu />
          <div className="hidden md:flex  flex-row ml-5 items-center gap-2">
            <Input
              placeholder="Search anything..."
              onChange={e => setSearchQuery(e.target.value)}
            />
            <SearchIcon
              onClick={handleSearchQuery}
              className=" cursor-pointer"
            />
          </div>
          <FriendReqsMenu />
          <FriendList />
          <Drawer open={open} onClose={toggleDrawer(false)}>
            <div className=" flex m-3 flex-row ml-5 items-center gap-2">
              <Input
                placeholder="Search anything..."
                onChange={e => setSearchQuery(e.target.value)}
              />
              <SearchIcon
                onClick={handleSearchQuery}
                className=" cursor-pointer"
              />
            </div>
          </Drawer>
        </>
      )}
    </div>
  );
}

export default SocialNav;
