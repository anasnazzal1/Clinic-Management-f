import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search } from 'lucide-react';
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
  lastMessage?: Message;
  unreadCount?: number;
}

export const MessagesPage = () => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationsWithLastMessage, setConversationsWithLastMessage] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    // Enhance conversations with last message and unread count
    const enhanced = conversations.map(async (conv) => {
      try {
        const response = await fetch(`http://localhost:3000/api/chat/messages/${conv._id}?limit=1`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const messages = await response.json();
        const lastMessage = messages.length > 0 ? messages[0] : null;

        // Count unread messages for this conversation
        const unreadResponse = await fetch(`http://localhost:3000/api/chat/messages/${conv._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const allMessages = await unreadResponse.json();
        const currentUserId = JSON.parse(localStorage.getItem('clinicUser') || '{}').id;
        const unreadCount = allMessages.filter((msg: Message) =>
          msg.senderId._id !== currentUserId && !msg.read
        ).length;

        return {
          ...conv,
          lastMessage,
          unreadCount,
        };
      } catch (error) {
        return conv;
      }
    });

    Promise.all(enhanced).then(setConversationsWithLastMessage);
  }, [conversations]);

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
    const userRole = JSON.parse(localStorage.getItem('clinicUser') || '{}').role;
    return userRole === 'doctor' ? conversation.patientId.name : conversation.doctorId.name;
  };

  const getMessageAlignment = (message: Message) => {
    const currentUserId = JSON.parse(localStorage.getItem('clinicUser') || '{}').id;
    return message.senderId._id === currentUserId ? 'flex-end' : 'flex-start';
  };

  const filteredConversations = conversationsWithLastMessage.filter(conv => {
    const displayName = getConversationDisplayName(conv);
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Sidebar - Conversations List */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Messages
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => {
                      setCurrentConversation(conversation);
                      loadMessages(conversation._id);
                    }}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      currentConversation?._id === conversation._id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="gradient-primary text-primary-foreground">
                          {getConversationDisplayName(conversation).split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {getConversationDisplayName(conversation)}
                          </p>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conversation.lastMessage.message}
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(conversation.lastMessage.createdAt), 'MMM d, HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="font-display text-lg">
                {getConversationDisplayName(currentConversation)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
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
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full"
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
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};