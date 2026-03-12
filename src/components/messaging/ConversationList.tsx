import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Conversation } from "@/hooks/useRealtimeMessages";

interface ConversationListProps {
  conversations: Conversation[];
  activeContactId: string | null;
  onSelect: (contactId: string) => void;
}

export function ConversationList({ conversations, activeContactId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher une conversation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune conversation</p>
        ) : (
          filtered.map((conv) => {
            const initials = conv.contactName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isActive = activeContactId === conv.contactId;
            const time = new Date(conv.lastMessage.created_at).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <button
                key={conv.contactId}
                onClick={() => onSelect(conv.contactId)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-accent/50 ${
                  isActive ? "bg-accent" : ""
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{conv.contactName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge variant="destructive" className="shrink-0 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </button>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}
