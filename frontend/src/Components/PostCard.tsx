import { Avatar } from '@mui/material';
import React from 'react';

type PostCardProps = {
  text: string;
  authorName: string;
  authorImage: string;
  createdAt: string;
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
  authorImage,
  createdAt,
}: PostCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-lg w-[20%] p-3 border border-gray-200 shadow">
      <div className="flex flex-row gap-3">
        <Avatar className="mt-1" src={authorImage} />
        <div>
          <p className="font-bold">{authorName}</p>
          <p className=" text-xs">{convertDateFormat(createdAt)}</p>
        </div>
      </div>

      <p>{text}</p>
    </div>
  );
}
