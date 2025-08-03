import { useContext, useEffect, useState } from 'react';
import {
  useCommentPost,
  useDeleteComment,
  useDeletePost,
  useLikePost,
  useUnlikePost,
} from '../Hooks/postHooks';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import EditPostModal from './EditPostModal';
import ShareButton from './ShareButton';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import { CommentType, SharedPost } from '../Types/types';
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import ImageWithSkeleton from './ImageWithSkeleton';

type SharedPostCardProps = {
  sharedPost: SharedPost;
  refetch: () => void;
  isLoggedInUser: boolean;
  profileImage?: string;
};

function SharedPostCard({
  sharedPost,
  refetch,
  isLoggedInUser,
  profileImage,
}: SharedPostCardProps) {
  const {
    state: { userInfo },
  } = useContext(Store);

  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { mutateAsync: likePost } = useLikePost();
  const { mutateAsync: unlikePost } = useUnlikePost();
  const { mutateAsync: commentPost } = useCommentPost();
  const { mutateAsync: deleteComment } = useDeleteComment();
  const { mutateAsync: deletePost } = useDeletePost();

  const originalPost = sharedPost.originalPost;

  if (!originalPost) {
    return null; // Don't render if original post is missing
  }

  const handleLike = async () => {
    await likePost({ userName: userInfo.name, postId: originalPost._id });
    refetch();
  };

  const handleUnlike = async () => {
    await unlikePost({ userName: userInfo.name, postId: originalPost._id });
    refetch();
  };

  const handleComment = async () => {
    await commentPost({
      userName: userInfo.name,
      postId: originalPost._id,
      comment,
    });
    setComment('');
    refetch();
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment({ postId: originalPost._id, commentId });
    refetch();
  };

  const handleDeletePost = async () => {
    await deletePost({ id: sharedPost._id });
    refetch();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    }
  };

  const isLiked = originalPost.likers.includes(userInfo.name);

  return (
    <div className="bg-white rounded-lg w-[90%] md:w-[30%] p-4 border border-gray-200 shadow">
      {/* Shared Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profileImage} className="object-cover" />
            <AvatarFallback>
              {sharedPost.sharedByUserName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              to={`/user/${sharedPost.sharedByUserName}`}
              className="font-semibold text-sm hover:underline"
            >
              {sharedPost.sharedByUserName}
            </Link>
            <p className="text-xs text-gray-500">
              shared • {formatDate(sharedPost.createdAt)}
            </p>
          </div>
        </div>
        {isLoggedInUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MenuDotsIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDeletePost}
                className="text-red-600"
              >
                <DeleteIcon className="mr-2 h-4 w-4" />
                Delete Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Share Message */}
      {sharedPost.shareMessage && (
        <div className="mb-3">
          <p className="text-sm">{sharedPost.shareMessage}</p>
        </div>
      )}

      {/* Original Post Container */}
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        {/* Original Post Header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={originalPost.authorImage}
              className="object-cover"
            />
            <AvatarFallback>
              {originalPost.authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              to={`/user/${originalPost.authorName}`}
              className="font-semibold text-sm hover:underline"
            >
              {originalPost.authorName}
            </Link>
            <p className="text-xs text-gray-500">
              {formatDate(originalPost.createdAt)}
            </p>
          </div>
        </div>

        {/* Original Post Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap">{originalPost.post}</p>
        </div>

        {/* Original Post Images */}
        {originalPost.images && originalPost.images.length > 0 && (
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              {originalPost.images.map((image, index) => (
                <ImageWithSkeleton
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Original Post Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{originalPost.likers.length} likes</span>
          <span>{originalPost.comments.length} comments</span>
          {originalPost.shareCount && originalPost.shareCount > 0 && (
            <span>{originalPost.shareCount} shares</span>
          )}
        </div>

        {/* Action Buttons */}
        {/* <div className="flex items-center justify-between border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={isLiked ? handleUnlike : handleLike}
            className={twMerge(
              'flex-1 text-xs',
              isLiked ? 'text-blue-600' : 'text-gray-600'
            )}
          >
            👍 {isLiked ? 'Unlike' : 'Like'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1 text-xs text-gray-600"
          >
            <CommentIcon className="mr-1 h-4 w-4" />
            Comment
          </Button>
          <ShareButton postId={originalPost._id} />
        </div> */}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 border-t pt-3">
            {/* Add Comment */}
            <div className="flex gap-2 mb-3">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 min-h-[60px] text-xs"
              />
              <Button
                onClick={handleComment}
                size="sm"
                disabled={!comment.trim()}
              >
                Post
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-2">
              {originalPost.comments.map((comment: CommentType) => (
                <div
                  key={comment._id}
                  className="flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <Link
                        to={`/user/${comment.userName}`}
                        className="font-semibold text-xs hover:underline"
                      >
                        {comment.userName}
                      </Link>
                      <p className="text-xs mt-1">{comment.comment}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {comment.userName === userInfo.name && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="h-6 w-6 p-0 text-red-500"
                    >
                      <DeleteIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedPostCard;
