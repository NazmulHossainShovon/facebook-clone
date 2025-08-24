'use client';

import { Avatar } from '@mui/material';
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { Store } from '../lib/store';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function FriendList() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    state: { userInfo },
  } = useContext(Store);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button onClick={handleClick} className=" text-right">
            Friends
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {userInfo.friends?.map(user => (
            <DropdownMenuItem onClick={handleClose} key={user}>
              <Link className="flex  flex-row gap-2" href={`/${user}`}>
                <Avatar src={`https://nazmul.sirv.com/facebook/${user}.png`} />
                <div>{user}</div>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
