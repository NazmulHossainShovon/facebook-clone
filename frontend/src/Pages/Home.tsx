import React from 'react';
import { useGetFriendPosts } from '../Hooks/postHooks';
import PostCard from '../Components/PostCard';

export default function Home() {
  const { data, refetch } = useGetFriendPosts();

  return (
    <div className=" flex flex-col gap-4 items-center">
      <h2>Home Page</h2>
      {data?.map((post, index) => (
        <PostCard
          key={index}
          text={post.post}
          authorName={post.authorName}
          createdAt={post.createdAt}
          id={post._id}
          likers={post.likers}
          isLoggedInUser={false}
          comments={post.comments}
          refetch={refetch}
        />
      ))}
    </div>
  );
}
