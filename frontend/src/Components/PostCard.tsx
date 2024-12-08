import { MoreHoriz } from '@mui/icons-material';
import { Box, Button, Menu, MenuItem, Modal, TextField } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  useCommentPost,
  useDeletePost,
  useLikePost,
  useUnlikePost,
} from '../Hooks/postHooks';
import { Store } from '../Store';
import { modalStyle } from '../Constants/constants';
import { Link } from 'react-router-dom';
import EditPostModal from './EditPostModal';
import CommentIcon from '@mui/icons-material/Comment';
import { CommentType } from '../Types/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type PostCardProps = {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
  isLoggedInUser: boolean;
  refetch?: () => void;
  likers: string[];
  comments: CommentType[];
  onPostUpdate?: (updatedPost: Post) => void;
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
  onPostUpdate,
  comments,
}: PostCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    state: { userInfo },
  } = useContext(Store);
  const { mutateAsync: deletePost } = useDeletePost();
  const { mutateAsync: likePost } = useLikePost();
  const { mutateAsync: unlikePost } = useUnlikePost();
  const { mutateAsync: commentPost } = useCommentPost();
  const [modalOpen, setModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [allComments, setAllComments] = useState<CommentType[]>([]);
  const open = Boolean(anchorEl);
  const editModalRef = useRef();

  const openEditModal = () => {
    editModalRef.current.handleModalOpen();
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const handleCommentModalOpen = () => setCommentModalOpen(true);
  const handleCommentModalClose = () => setCommentModalOpen(false);

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

  const handleComment = async () => {
    const updatedPost = await commentPost({
      userName: userInfo.name,
      postId: id,
      comment,
    });

    setAllComments(updatedPost.comments);

    setComment('');
  };

  useEffect(() => {
    setAllComments(comments);
  }, [comments]);

  return (
    <div className="flex flex-col gap-3 bg-white rounded-lg w-[90%] md:w-[30%] p-3 border border-gray-200 shadow">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Link to={`/${authorName}`}>
            <Avatar>
              <AvatarImage
                className="mt-1"
                src={`https://nazmul.sirv.com/facebook/${authorName}.png`}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>

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
      <div className="flex flex-row justify-center items-center gap-3 w-full">
        <Button onClick={handleLike} variant="outlined">
          {likers?.includes(userInfo.name) ? 'Unlike' : 'Like'}
        </Button>
        <button
          onClick={handleModalOpen}
          className=" hover:underline hover:cursor-pointer"
        >
          {' '}
          {likers?.length} people{' '}
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
            {likers?.map(liker => (
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
        <CommentIcon
          className="cursor-pointer"
          onClick={handleCommentModalOpen}
        />
        <Modal
          open={commentModalOpen}
          onClose={handleCommentModalClose}
          aria-labelledby="comment-modal"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              ...modalStyle,
            }}
          >
            <div className="flex flex-row gap-3 pl-4">
              <TextField
                onChange={e => setComment(e.target.value)}
                value={comment}
                label="write a comment"
              />
              <Button onClick={handleComment}>Comment</Button>
            </div>

            <div>
              {allComments?.map((comment, index) => (
                <div key={index} className="flex flex-row gap-3 pl-4">
                  <Avatar
                    className="mt-1"
                    src={`https://nazmul.sirv.com/facebook/${comment.userName}.png`}
                  />
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
          </Box>
        </Modal>
        <EditPostModal
          onPostUpdate={onPostUpdate}
          id={id}
          post={text}
          ref={editModalRef}
        />
      </div>
    </div>
  );
}
