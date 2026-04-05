import React from 'react';

interface MessageDisplayProps {
  message: string;
  type?: 'success' | 'error';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  type = 'success',
}) => {
  if (!message) return null;

  const classes =
    type === 'success'
      ? 'mt-4 p-3 rounded-md bg-status-success text-white'
      : 'mt-4 p-3 rounded-md bg-status-error text-white';

  return (
    <div role="status" aria-live="polite" className={classes}>
      {message}
    </div>
  );
};

export default MessageDisplay;
