'use client';

import { useState, useContext, useEffect } from 'react';
import { useChatSocket } from '../../hooks/use-chat';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { Store } from '../../lib/store';
import { useGetUserFriends } from '../../hooks/user-hooks';
import apiClient from '../../lib/api-client';

export default function ChatIntegration() {
  const [open, setOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    undefined
  );
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const {
    state: { userInfo },
  } = useContext(Store);
  const { data: friends = [], isLoading } = useGetUserFriends(userInfo.name);
  const currentUserId = userInfo._id;
  const {
    state: chatState,
    sendMessage,
    joinRoom,
  } = useChatSocket(currentUserId);

  // Fetch chat rooms for the current user
  useEffect(() => {
    if (!currentUserId) return;
    setLoadingRooms(true);
    apiClient
      .get(`/api/chat/rooms/${currentUserId}`)
      .then((res: { data: any[] }) => setChatRooms(res.data))
      .finally(() => setLoadingRooms(false));
  }, [currentUserId]);

  // Find or create a chat room with a friend

  const getOrCreateChatRoom = async (friendId: string) => {
    // Try to find an existing room with these two participants (by user IDs)
    let room = chatRooms.find(
      r =>
        Array.isArray(r.participants) &&
        r.participants.length === 2 &&
        r.participants.includes(currentUserId) &&
        r.participants.includes(friendId)
    );

    if (room) return room;
    // Create new room
    const res = await apiClient.post('/api/chat/rooms', {
      participantIds: [currentUserId, friendId],
    });
    setChatRooms(prev => [...prev, res.data]);
    return res.data;
  };

  // Join the room when a chat is selected
  const handleSelectChat = async (friendName: string) => {
    // Find friend by name to get their _id
    const friend = friends.find(f => f.name === friendName);
    if (!friend || !friend._id) return;
    const room = await getOrCreateChatRoom(friend._id);
    if (room && room._id) {
      setSelectedChatId(prev => {
        const newId = prev === room._id ? undefined : room._id;
        if (newId) joinRoom(newId);
        return newId;
      });
    }
  };

  const handleSendMessage = (message: string) => {
    if (selectedChatId && message.trim()) {
      sendMessage(selectedChatId, message);
    }
  };

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
                : friends.map(friend => {
                    // Find chat room for this friend by user ID
                    const room = chatRooms.find(
                      r =>
                        Array.isArray(r.participants) &&
                        r.participants.length === 2 &&
                        r.participants.includes(currentUserId) &&
                        r.participants.includes(friend._id)
                    );
                    return {
                      id: friend.name, // keep id as friend name for selection
                      name: friend.name,
                      profileImage: friend.profileImage,
                      chatRoomId: room?._id,
                    };
                  })
            }
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChatId}
          />
          <div className="flex-1 flex flex-col">
            {selectedChatId && (
              <ChatWindowContainer
                chatRoomId={selectedChatId}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
import ChatWindowContainer from './ChatWindowContainer';
