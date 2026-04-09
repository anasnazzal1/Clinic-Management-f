import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, X } from 'lucide-react';
import { format } from 'date-fns';

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

interface ChatProps {
  initialConversation?: Conversation;
  onClose?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ initialConversation, onClose }) => {
  const {
    conversations,
    currentConversation,
    messages,
    loadConversations,
    loadMessages,
    sendMessage,
    setCurrentConversation,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (initialConversation) {
      setCurrentConversation(initialConversation);
      loadMessages(initialConversation._id);
    }
  }, [initialConversation]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation._id);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      await sendMessage(currentConversation._id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationDisplayName = (conversation: Conversation) => {
    // For doctors, show patient name; for patients, show doctor name
    const userRole = localStorage.getItem('clinicUser') ? JSON.parse(localStorage.getItem('clinicUser')!).role : '';
    return userRole === 'doctor' ? conversation.patientId.name : conversation.doctorId.name;
  };

  const getMessageAlignment = (message: Message) => {
    const currentUserId = JSON.parse(localStorage.getItem('clinicUser') || '{}').id;
    return message.senderId._id === currentUserId ? 'flex-end' : 'flex-start';
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 p-0"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {currentConversation ? getConversationDisplayName(currentConversation) : 'Chat'}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0"
          >
            -
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full relative">
        {!currentConversation ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4 pb-20">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${getMessageAlignment(message) === 'flex-end' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        getMessageAlignment(message) === 'flex-end'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border-2 focus:border-primary"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="rounded-full px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};