'use client';

import { useState, useContext } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { Store } from '../../lib/store';
import { useGetUserFriends } from '../../hooks/user-hooks';

export default function ChatIntegration() {
  const [open, setOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    undefined
  );
  const {
    state: { userInfo },
  } = useContext(Store);
  const { data: friends = [], isLoading } = useGetUserFriends(userInfo.name);
  const messages: any[] = [];
  const currentUserId = userInfo.name;
  const handleSelectChat = (chatId: string) => setSelectedChatId(chatId);
  const handleSendMessage = () => {};

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-blue-700 focus:outline-none"
        onClick={() => setOpen(v => !v)}
        aria-label="Open Chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75"
          />
        </svg>
      </button>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl flex w-[400px] h-[500px] overflow-hidden border border-gray-200">
          <ChatSidebar
            chats={
              isLoading
                ? []
                : friends.map(friend => ({
                    id: friend.name,
                    name: friend.name,
                    profileImage: friend.profileImage,
                  }))
            }
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChatId}
          />
          <div className="flex-1 flex flex-col">
            {selectedChatId && (
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
