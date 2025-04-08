
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Clock, Check, MessageCircle, User, Home, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

interface Message {
  id: number;
  patient: string;
  content: string;
  timestamp: string;
  read: boolean;
  sender: "doctor" | "patient";
}

const Messages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      patient: "Marie Dubois",
      content: "Bonjour Docteur, je souhaiterais un renouvellement de mon ordonnance.",
      timestamp: "2024-02-20 10:30",
      read: false,
      sender: "patient"
    },
    {
      id: 2,
      patient: "Jean Martin",
      content: "Les nouveaux médicaments me conviennent parfaitement.",
      timestamp: "2024-02-20 09:15",
      read: true,
      sender: "patient"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add new message to the messages state
      const newMessageObj: Message = {
        id: messages.length + 1,
        patient: "Patient actuel", // This would be replaced with the actual selected patient
        content: newMessage,
        timestamp: new Date().toLocaleString("fr-FR"),
        read: true,
        sender: "doctor"
      };
      
      setMessages([...messages, newMessageObj]);
      setNewMessage("");
      toast.success("Message envoyé");
    } else {
      toast.error("Veuillez écrire un message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredMessages = messages.filter(message =>
    message.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-lg bg-white shadow-sm h-[calc(100vh-8rem)]">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Messages</h2>
            <Badge variant="secondary">
              {messages.filter(m => !m.read).length} non lu(s)
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Link to="/">
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
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher dans les messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-13rem)] p-6">
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <p className="text-center text-gray-500">Aucun message trouvé</p>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.read ? "bg-gray-50" : "bg-blue-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{message.patient}</h3>
                    {!message.read && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {message.timestamp}
                    {message.read && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                <p className="text-gray-700">{message.content}</p>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Répondre
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
