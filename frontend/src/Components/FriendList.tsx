import { Avatar, Button, Menu, MenuItem } from '@mui/material';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../Store';

export default function FriendList() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    state: { userInfo },
  } = useContext(Store);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button onClick={handleClick} className=" text-right" variant="contained">
        Friends
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem disabled>Friend List</MenuItem>
        {userInfo.friends?.map(user => (
          <MenuItem
            onClick={handleClose}
            className="flex  flex-row gap-2"
            key={user}
          >
            <Link to={`/${user}`}>
              <Avatar src={`https://nazmul.sirv.com/facebook/${user}.png`} />
              <div>{user}</div>
            </Link>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
