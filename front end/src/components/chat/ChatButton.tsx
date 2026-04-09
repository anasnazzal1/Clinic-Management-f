import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Chat } from './Chat';
import { useChat } from '@/contexts/ChatContext';
import { toast } from 'sonner';

interface ChatButtonProps {
  doctorId: string;
  patientId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children?: React.ReactNode;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  doctorId,
  patientId,
  variant = 'outline',
  size = 'sm',
  children,
}) => {
  const { createConversation, setCurrentConversation } = useChat();
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState<any>(null);

  const handleStartChat = async () => {
    try {
      const conv = await createConversation(doctorId, patientId);
      setConversation(conv);
      setCurrentConversation(conv);
      setShowChat(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start chat');
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleStartChat}
        className="flex items-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        {children || 'Chat'}
      </Button>
      {showChat && conversation && (
        <Chat
          initialConversation={conversation}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};