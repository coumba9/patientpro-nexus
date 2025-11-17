
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Search, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { messageService, type Message } from "@/api";
import { toast } from "sonner";

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await messageService.getMessagesByUser(user.id);
        setMessages(data);
      } catch (e) {
        console.error("Error loading messages:", e);
        toast.error("Erreur lors du chargement des messages");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = messages.filter((m) => {
    const sender = m.sender ? `${m.sender.first_name} ${m.sender.last_name}` : "";
    const receiver = m.receiver ? `${m.receiver.first_name} ${m.receiver.last_name}` : "";
    return (
      sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const unreadCount = messages.filter((m) => !m.is_read && m.receiver_id === user?.id).length;

  const otherPartyId = (msg: Message) => (msg.receiver_id === user?.id ? msg.sender_id : msg.receiver_id);
  const otherPartyName = (msg: Message) => {
    const isReceived = msg.receiver_id === user?.id;
    const p = isReceived ? msg.sender : msg.receiver;
    return p ? `${p.first_name} ${p.last_name}` : "Contact";
  };

  const handleSendReply = async () => {
    if (!activeMessage || !replyText.trim() || !user?.id) return;
    const toId = otherPartyId(activeMessage);
    try {
      await messageService.sendMessage({
        sender_id: user.id,
        receiver_id: toId,
        subject: `Réponse: ${activeMessage.subject}`,
        content: replyText.trim(),
        appointment_id: activeMessage.appointment_id || undefined,
      } as any);
      toast.success(`Message envoyé à ${otherPartyName(activeMessage)}`);
      setReplyText("");
      const data = await messageService.getMessagesByUser(user.id);
      setMessages(data);
      const latest = data.find((m) => otherPartyId(m) === toId);
      setActiveMessage(latest || null);
    } catch (e) {
      console.error("Error sending message:", e);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm h-[calc(100vh-8rem)]">
      <div className="p-6 border-b dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Messages</h2>
            <Badge variant="destructive">{unreadCount} non lus</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" /> Accueil
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 h-[calc(100%-6rem)]">
        <ScrollArea className="h-full p-6 border-r dark:border-gray-800">
          {loading ? (
            <div className="text-center py-8">Chargement des messages...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun message</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((m) => {
                const isReceived = m.receiver_id === user?.id;
                const contact = otherPartyName(m);
                return (
                  <Card
                    key={m.id}
                    className={`cursor-pointer ${!m.is_read && isReceived ? 'border-primary bg-primary/5' : ''}`}
                    onClick={async () => {
                      setActiveMessage(m);
                      if (isReceived && !m.is_read) {
                        await messageService.markAsRead(m.id);
                        const data = await messageService.getMessagesByUser(user!.id);
                        setMessages(data);
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{isReceived ? '← ' : '→ '}{contact}</CardTitle>
                        <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{m.subject}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-2">{m.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex flex-col h-full p-6">
          {activeMessage ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Répondre à</p>
                <p className="font-medium">{otherPartyName(activeMessage)}</p>
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Votre message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
              </div>
              <div className="mt-3">
                <Button onClick={handleSendReply} disabled={!replyText.trim()} className="flex items-center gap-2">
                  <Send className="h-4 w-4" /> Envoyer
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Sélectionnez un message à gauche pour répondre
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

