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
    const res = await apiClient.get(`/api/chat/messages/${chatRoomId}`);
    setMessages(res.data);
  };

  useEffect(() => {
    if (chatRoomId) {
      fetchChatHistory();
    }
    // Optionally, add polling or websocket updates here
  }, [chatRoomId]);

  // Always call fetchChatHistory after sending a message
  const handleSendMessage = async (message: string) => {
    if (onSendMessage) {
      await onSendMessage(message);
      await fetchChatHistory();
    } else {
      //   await apiClient.post('/api/chat/send', { chatRoomId, message });
      await fetchChatHistory();
    }
  };

  return (
    <ChatWindow
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserId={userInfo._id}
    />
  );
};

export default ChatWindowContainer;
