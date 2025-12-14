import React from 'react';

interface MessageDisplayProps {
  message: string;
  type?: 'success' | 'error';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  
  return (
    <div className={`mt-4 p-3 rounded-md ${bgColor}`}>
      {message}
    </div>
  );
};

export default MessageDisplay;