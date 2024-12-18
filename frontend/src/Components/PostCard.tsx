import { TextField } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import {
  useCommentPost,
  useDeletePost,
  useLikePost,
  useUnlikePost,
} from '../Hooks/postHooks';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import EditPostModal from './EditPostModal';
import CommentIcon from '@mui/icons-material/Comment';
import { CommentType } from '../Types/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { twMerge } from 'tailwind-merge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import MenuDotsIcon from '@/icons/MenuDotsIcon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

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
  const {
    state: { userInfo },
  } = useContext(Store);
  const { mutateAsync: deletePost } = useDeletePost();
  const { mutateAsync: likePost } = useLikePost();
  const { mutateAsync: unlikePost } = useUnlikePost();
  const { mutateAsync: commentPost } = useCommentPost();
  const [comment, setComment] = useState('');
  const [allComments, setAllComments] = useState<CommentType[]>([]);

  const handleDelete = async () => {
    await deletePost({ id });
    await refetch();
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
                src={`https://nazmul.sirv.com/facebook/${authorName}.png`}
                className=" object-cover"
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MenuDotsIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isLoggedInUser && (
                <>
                  <DropdownMenuItem onClick={handleDelete}>
                    Delete Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <EditPostModal
                    onPostUpdate={onPostUpdate}
                    id={id}
                    post={text}
                  />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p>{text}</p>
      <div className="flex flex-row justify-center items-center gap-3 w-full">
        <Button
          className={twMerge(
            'bg-white text-slate-400 hover:bg-slate-100',
            likers?.includes(userInfo.name) && 'text-blue-600'
          )}
          onClick={handleLike}
        >
          {likers?.includes(userInfo.name) ? 'Unlike' : 'Like'}
        </Button>

        <Dialog>
          <DialogTrigger>
            <button className=" hover:underline hover:cursor-pointer">
              {' '}
              {likers?.length} people{' '}
            </button>
          </DialogTrigger>
          <DialogContent>
            {likers?.map(liker => (
              <div key={liker}>
                <Link
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  to={`/${liker}`}
                >
                  <Avatar>
                    <AvatarImage
                      src={`https://nazmul.sirv.com/facebook/${liker}.png`}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p>{liker}</p>
                </Link>
              </div>
            ))}
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <CommentIcon className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent>
            <DialogDescription className=" flex flex-col gap-2 p-3">
              <div className="flex flex-row gap-3 pl-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="comment">write a comment</Label>
                  <Textarea
                    onChange={e => setComment(e.target.value)}
                    id="comment"
                    value={comment}
                    rows={3}
                    className=" resize-none"
                  />
                </div>

                <Button className="relative top-4" onClick={handleComment}>
                  Comment
                </Button>
              </div>

              <div>
                {allComments?.map((comment, index) => (
                  <div key={index} className="flex flex-row gap-3 pl-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://nazmul.sirv.com/facebook/${comment.userName}.png`}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    <p>{comment.comment}</p>
                  </div>
                ))}
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
