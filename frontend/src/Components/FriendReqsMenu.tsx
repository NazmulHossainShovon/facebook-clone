import { Avatar, Menu, MenuItem } from '@mui/material';
import { Store } from '../Store';
import { Link, useNavigate } from 'react-router-dom';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useContext, useState } from 'react';

export default function FriendReqsMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    state: { userInfo },
  } = useContext(Store);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  console.log(userInfo);

  return (
    <div>
      <PeopleAltIcon className="cursor-pointer" onClick={handleClick} />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        className="p-2"
      >
        <MenuItem disabled>Friend Requests</MenuItem>
        {userInfo.receivedFriendReqs?.map(user => (
          <MenuItem
            onClick={handleClose}
            className="flex flex-row gap-2"
            key={user}
          >
            <Link to={`/${user}`}>
              <Avatar src={`https://nazmul.sirv.com/facebook/${user}.png`} />
              <div>{user}</div>
            </Link>
          </MenuItem>
        ))}
        {userInfo.receivedFriendReqs?.length === 0 && (
          <MenuItem disabled>No Friend Requests</MenuItem>
        )}
      </Menu>
    </div>
  );
}
