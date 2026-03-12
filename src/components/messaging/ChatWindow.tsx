import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import type { RealtimeMessage } from "@/hooks/useRealtimeMessages";

interface ChatWindowProps {
  contactName: string;
  contactId: string;
  messages: RealtimeMessage[];
  currentUserId: string;
  onSend: (content: string) => Promise<void>;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatWindow({
  contactName,
  contactId,
  messages,
  currentUserId,
  onSend,
  onBack,
  showBackButton,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText("");
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  // Group messages by date
  const grouped: { date: string; msgs: RealtimeMessage[] }[] = [];
  messages.forEach((m) => {
    const d = new Date(m.created_at).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) {
      last.msgs.push(m);
    } else {
      grouped.push({ date: d, msgs: [m] });
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
          {contactName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-sm">{contactName}</p>
          <p className="text-xs text-muted-foreground">En ligne</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-1">
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {formatDate(group.msgs[0].created_at)}
                </span>
              </div>
              {group.msgs.map((m) => {
                const isMine = m.sender_id === currentUserId;
                return (
                  <div key={m.id} className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(m.created_at)}
                        {isMine && (m.is_read ? " ✓✓" : " ✓")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Écrivez votre message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="shrink-0 h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
