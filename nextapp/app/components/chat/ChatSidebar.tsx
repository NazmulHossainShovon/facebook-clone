import React from 'react';

interface ChatSidebarProps {
  chats: Array<{
    id: string;
    name: string;
    lastMessage?: string;
    lastActivity?: string;
  }>;
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  onSelectChat,
  selectedChatId,
}) => {
  return (
    <aside className="w-64 bg-gray-100 border-r h-full overflow-y-auto">
      <h2 className="p-4 font-bold text-lg">Chats</h2>
      <ul>
        {chats.map(chat => (
          <li
            key={chat.id}
            className={`p-4 cursor-pointer hover:bg-gray-200 ${selectedChatId === chat.id ? 'bg-gray-300' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="font-semibold">{chat.name}</div>
            {chat.lastMessage && (
              <div className="text-sm text-gray-600 truncate">
                {chat.lastMessage}
              </div>
            )}
            {chat.lastActivity && (
              <div className="text-xs text-gray-400">{chat.lastActivity}</div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ChatSidebar;
