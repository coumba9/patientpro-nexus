
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Clock, Check, MessageCircle, ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Message {
  id: number;
  doctor: string;
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
      doctor: "Dr. Sarah Martin",
      content: "Bonjour, comment vous sentez-vous depuis notre dernière consultation ?",
      timestamp: "2024-02-19 14:30",
      read: true,
      sender: "doctor"
    },
    {
      id: 2,
      doctor: "Dr. Thomas Bernard",
      content: "N'oubliez pas de prendre vos médicaments comme prescrit.",
      timestamp: "2024-02-18 10:15",
      read: false,
      sender: "doctor"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add new message to the messages state
      const newMessageObj: Message = {
        id: messages.length + 1,
        doctor: "Dr. actuel", // This would be replaced with the actual selected doctor
        content: newMessage,
        timestamp: new Date().toLocaleString("fr-FR"),
        read: true,
        sender: "patient"
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
    message.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)]">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Messages</h2>
            <span className="bg-primary px-2 py-1 rounded-full text-xs text-white">
              {messages.filter(m => !m.read).length} non lu(s)
            </span>
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
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{message.doctor}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {message.timestamp}
                    {message.read && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                <p className="text-gray-700">{message.content}</p>
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
