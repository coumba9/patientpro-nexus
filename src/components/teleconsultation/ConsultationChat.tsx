import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { ChatMessage } from '@/hooks/useVideoCall';
import { cn } from '@/lib/utils';

interface ConsultationChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isConnected: boolean;
}

export const ConsultationChat = ({ messages, onSendMessage, isConnected }: ConsultationChatProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Chat de consultation</h3>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-8">
              {isConnected 
                ? "Envoyez un message pour commencer la conversation" 
                : "Le chat sera disponible une fois connecté"}
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.sender === 'local' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <span className="text-[10px] text-muted-foreground mb-0.5">
                {msg.senderName} · {formatTime(msg.timestamp)}
              </span>
              <div
                className={cn(
                  "px-3 py-2 rounded-2xl text-sm",
                  msg.sender === 'local'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Message..." : "En attente de connexion..."}
            disabled={!isConnected}
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
