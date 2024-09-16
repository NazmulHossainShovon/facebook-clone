import { MoreHoriz } from '@mui/icons-material';
import { Avatar, Box, Button, Menu, MenuItem, Modal } from '@mui/material';
import React, { useContext, useRef, useState } from 'react';
import { useDeletePost, useLikePost, useUnlikePost } from '../Hooks/postHooks';
import { Store } from '../Store';
import { modalStyle } from '../Constants/constants';
import { Link } from 'react-router-dom';
import EditPostModal from './EditPostModal';

type PostCardProps = {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
  isLoggedInUser: boolean;
  refetch: () => void;
  likers: string[];
};

function convertDateFormat(dateString) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

export default function PostCard({
  text,
  authorName,
  createdAt,
  id,
  refetch,
  isLoggedInUser,
  likers,
}: PostCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    state: { userInfo },
  } = useContext(Store);
  const { mutateAsync: deletePost } = useDeletePost();
  const { mutateAsync: likePost } = useLikePost();
  const { mutateAsync: unlikePost } = useUnlikePost();
  const [modalOpen, setModalOpen] = useState(false);
  const open = Boolean(anchorEl);
  const editModalRef = useRef();

  const openEditModal = () => {
    editModalRef.current.handleModalOpen();
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleDelete = async () => {
    await deletePost({ id });
    await refetch();
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLike = async () => {
    if (likers.includes(userInfo.name)) {
      await unlikePost({ userName: userInfo.name, postId: id });
    } else {
      const data = await likePost({ userName: userInfo.name, postId: id });
    }

    await refetch();
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-lg w-[90%] md:w-[30%] p-3 border border-gray-200 shadow">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Avatar
            className="mt-1"
            src={`https://nazmul.sirv.com/facebook/${authorName}.png`}
          />
          <div>
            <p className="font-bold">{authorName}</p>
            <p className=" text-xs">{convertDateFormat(createdAt)}</p>
          </div>
        </div>
        {/* options button and menu */}
        <div>
          <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreHoriz />
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
            {isLoggedInUser && (
              <>
                <MenuItem onClick={handleDelete}>Delete Post</MenuItem>
                <MenuItem onClick={openEditModal}>Edit</MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>

      <p>{text}</p>
      <div className="flex flex-row justify-center gap-3 w-full">
        <Button onClick={handleLike} variant="outlined">
          {likers.includes(userInfo.name) ? 'Unlike' : 'Like'}
        </Button>
        <button
          onClick={handleModalOpen}
          className=" hover:underline hover:cursor-pointer"
        >
          {' '}
          {likers.length} people{' '}
        </button>
        <Modal
          open={modalOpen}
          onClose={handleModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              display: 'flex',
              gap: '20px',
              flexDirection: 'column',
              ...modalStyle,
            }}
          >
            {likers.map(liker => (
              <Box
                key={liker}
                sx={{ display: 'flex', gap: '10px', flexDirection: 'row' }}
              >
                <Link
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  to={`/${liker}`}
                  onClick={handleModalClose}
                >
                  <Avatar
                    className="mt-1"
                    src={`https://nazmul.sirv.com/facebook/${liker}.png`}
                  />
                  <p>{liker}</p>
                </Link>
              </Box>
            ))}
          </Box>
        </Modal>
        <EditPostModal post={text} ref={editModalRef} />
      </div>
    </div>
  );
}
