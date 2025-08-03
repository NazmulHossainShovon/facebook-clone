import { useContext, useState } from 'react';
import {
  useCommentPost,
  useDeleteComment,
  useDeletePost,
  useLikePost,
  useUnlikePost,
} from '../Hooks/postHooks';
import { Store } from '../Store';
import { SharedPost } from '../Types/types';
import SharedPostHeader from './SharedPost/SharedPostHeader';
import ShareMessage from './SharedPost/ShareMessage';
import OriginalPostContainer from './SharedPost/OriginalPostContainer';
import OriginalPostHeader from './SharedPost/OriginalPostHeader';
import OriginalPostContent from './SharedPost/OriginalPostContent';
import OriginalPostStats from './SharedPost/OriginalPostStats';
import OriginalPostActions from './SharedPost/OriginalPostActions';
import CommentsSection from './SharedPost/CommentsSection';

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

  const handleAddComment = async (comment: string) => {
    await commentPost({
      userName: userInfo.name,
      postId: originalPost._id,
      comment,
    });
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

  const handleToggleComments = () => {
    setShowComments(!showComments);
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
      <SharedPostHeader
        sharedByUserName={sharedPost.sharedByUserName}
        createdAt={sharedPost.createdAt}
        profileImage={profileImage}
        isLoggedInUser={isLoggedInUser}
        onDeletePost={handleDeletePost}
        formatDate={formatDate}
      />

      <ShareMessage shareMessage={sharedPost.shareMessage} />

      <OriginalPostContainer>
        <OriginalPostHeader
          authorName={originalPost.authorName}
          authorImage={originalPost.authorImage}
          createdAt={originalPost.createdAt}
          formatDate={formatDate}
        />

        <OriginalPostContent
          postText={originalPost.post}
          images={originalPost.images}
        />

        <OriginalPostActions
          isLiked={isLiked}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onToggleComments={handleToggleComments}
          post={originalPost}
        />

        <CommentsSection
          showComments={showComments}
          comments={originalPost.comments}
          currentUserName={userInfo.name}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          formatDate={formatDate}
        />
      </OriginalPostContainer>
    </div>
  );
}

export default SharedPostCard;
