import { Avatar } from '@mui/material';
import React from 'react';

type PostCardProps = {
  text: string;
  authorName: string;
  authorImage: string;
  createdAt: string;
};

export default function PostCard({
  text,
  authorName,
  authorImage,
  createdAt,
}: PostCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow">
      <div className="flex flex-row gap-3">
        <Avatar className="mt-1" src={authorImage} />
        <div>
          <p>{authorName}</p>
          <p>{createdAt}</p>
        </div>
      </div>

      <p>{text}</p>
    </div>
  );
}
