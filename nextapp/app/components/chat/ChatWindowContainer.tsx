import { useState, useEffect, useContext } from 'react';
import ChatWindow from './ChatWindow';
import apiClient from '../../lib/api-client';
import { Store } from '../../lib/store';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType?: string;
}

interface ChatWindowContainerProps {
  chatRoomId: string;
  onSendMessage?: (message: string) => void;
}

const ChatWindowContainer: React.FC<ChatWindowContainerProps> = ({
  chatRoomId,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const {
    state: { userInfo },
  } = useContext(Store);

  const fetchChatHistory = async () => {
    console.log(chatRoomId);

    const res = await apiClient.get(`/api/chat/messages/${chatRoomId}`);
    setMessages(res.data);
  };

  useEffect(() => {
    if (chatRoomId) {
      fetchChatHistory();
    }
    // Optionally, add polling or websocket updates here
  }, [chatRoomId]);

  // If onSendMessage is provided, use it; otherwise, fallback to local handler
  const handleSendMessage =
    onSendMessage ||
    (async (message: string) => {
      //   await apiClient.post('/api/chat/send', { chatRoomId, message });
      fetchChatHistory();
    });

  return (
    <ChatWindow
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserId={userInfo._id}
    />
  );
};

export default ChatWindowContainer;
