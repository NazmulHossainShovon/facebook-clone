import React from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType?: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  currentUserId,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
      </div>
      <div className="border-t p-2 bg-gray-50">
        <ChatInput onSend={onSendMessage} />
      </div>
    </div>
  );
};

export default ChatWindow;
