import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Home, ArrowLeft, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { messageService, type Message } from "@/api";
import { toast } from "sonner";

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await messageService.getMessagesByUser(user.id);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error("Erreur lors du chargement des messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const filteredMessages = messages.filter(message => {
    const senderName = message.sender ? `${message.sender.first_name} ${message.sender.last_name}` : '';
    const receiverName = message.receiver ? `${message.receiver.first_name} ${message.receiver.last_name}` : '';
    return senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           receiverName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unreadCount = messages.filter(m => !m.is_read && m.receiver_id === user?.id).length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Link to="/doctor">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Messages</h2>
              <Badge variant="destructive" className="ml-2">
                {unreadCount} non lus
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="text-center py-8">Chargement des messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun message</div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => {
                  const isReceived = message.receiver_id === user?.id;
                  const contactName = isReceived 
                    ? (message.sender ? `${message.sender.first_name} ${message.sender.last_name}` : 'Expéditeur inconnu')
                    : (message.receiver ? `${message.receiver.first_name} ${message.receiver.last_name}` : 'Destinataire inconnu');
                  
                  return (
                    <Card 
                      key={message.id}
                      className={`cursor-pointer transition-colors ${
                        !message.is_read && isReceived ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={async () => {
                        if (isReceived && !message.is_read) {
                          await messageService.markAsRead(message.id);
                          const data = await messageService.getMessagesByUser(user!.id);
                          setMessages(data);
                        }
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {isReceived ? '← ' : '→ '}{contactName}
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{message.subject}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{message.content}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour envoyer un message, cliquez sur un message existant pour répondre.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
