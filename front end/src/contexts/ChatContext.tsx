import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    role: string;
  };
  message: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialization?: string;
  };
  patientId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface ChatContextType {
  socket: Socket | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isConnected: boolean;
  unreadCount: number;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, message: string) => Promise<void>;
  createConversation: (doctorId: string, patientId: string) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io('http://localhost:3000', {
        auth: { token },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('receiveMessage', (message: Message) => {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        // Update unread count when receiving a new message
        loadUnreadCount();
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadUnreadCount();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/chat/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setMessages(data);
      // Mark messages as read when loading
      await markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    if (socket) {
      socket.emit('sendMessage', { conversationId, message });
    }
  };

  const createConversation = async (doctorId: string, patientId: string): Promise<Conversation> => {
    const response = await fetch('http://localhost:3000/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ doctorId, patientId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create conversation');
    }
    return data;
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`http://localhost:3000/api/chat/messages/read/${conversationId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/chat/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const value: ChatContextType = {
    socket,
    conversations,
    currentConversation,
    messages,
    isConnected,
    unreadCount,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    setCurrentConversation,
    markAsRead,
    loadUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};