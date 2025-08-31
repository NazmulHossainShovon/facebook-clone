import React from 'react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType?: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-xs break-words shadow text-sm ${
          isOwn ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'
        }`}
      >
        <div>{message.content}</div>
        <div className="text-xs text-gray-400 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
