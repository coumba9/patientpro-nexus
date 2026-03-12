import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface MessagingPageProps {
  homeRoute: string;
}

export function MessagingPage({ homeRoute }: MessagingPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    loading,
    totalUnread,
    sendMessage,
    markConversationAsRead,
    getConversationMessages,
    profiles,
  } = useRealtimeMessages(user?.id);

  const [activeContactId, setActiveContactId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.contactId === activeContactId);
  const activeMessages = activeContactId ? getConversationMessages(activeContactId) : [];
  const activeContactName = activeConversation?.contactName || "Contact";

  useEffect(() => {
    if (activeContactId) {
      markConversationAsRead(activeContactId);
    }
  }, [activeContactId, activeMessages.length, markConversationAsRead]);

  const handleSend = async (content: string) => {
    if (!activeContactId) return;
    const subject = activeConversation?.lastMessage?.subject || "Conversation";
    await sendMessage(activeContactId, content, subject);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Messagerie</h2>
          {totalUnread > 0 && (
            <Badge variant="destructive">{totalUnread} non lu{totalUnread > 1 ? "s" : ""}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <Link to={homeRoute}>
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-1" /> Accueil
            </Button>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Chargement des conversations...
          </div>
        ) : (
          <>
            {/* Conversation list - hidden on mobile when chat is open */}
            <div
              className={`w-full md:w-80 lg:w-96 shrink-0 ${
                activeContactId ? "hidden md:flex md:flex-col" : "flex flex-col"
              }`}
            >
              <ConversationList
                conversations={conversations}
                activeContactId={activeContactId}
                onSelect={setActiveContactId}
              />
            </div>

            {/* Chat window */}
            <div className={`flex-1 ${activeContactId ? "flex flex-col" : "hidden md:flex md:flex-col"}`}>
              {activeContactId && user ? (
                <ChatWindow
                  contactName={activeContactName}
                  contactId={activeContactId}
                  messages={activeMessages}
                  currentUserId={user.id}
                  onSend={handleSend}
                  onBack={() => setActiveContactId(null)}
                  showBackButton
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <MessageSquare className="h-12 w-12 opacity-30" />
                  <p>Sélectionnez une conversation pour commencer</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
