import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
}

const categories = [
  { value: "appointment", label: "Rendez-vous" },
  { value: "payment", label: "Paiement" },
  { value: "technical", label: "Problème technique" },
  { value: "medical", label: "Question médicale" },
  { value: "account", label: "Mon compte" },
  { value: "other", label: "Autre" },
];

const priorities = [
  { value: "low", label: "Faible" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Urgent" },
];

export const SupportTickets = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "normal",
    description: "",
  });

  useEffect(() => {
    if (!user?.id) return;
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erreur chargement tickets:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!user?.id) return;
    if (!newTicket.subject || !newTicket.category || !newTicket.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: newTicket.subject,
        category: newTicket.category,
        priority: newTicket.priority,
        description: newTicket.description,
        status: 'open',
      });

      if (error) throw error;

      toast.success('Ticket créé avec succès');
      setIsDialogOpen(false);
      setNewTicket({
        subject: "",
        category: "",
        priority: "normal",
        description: "",
      });
      loadTickets();
    } catch (error) {
      console.error('Erreur création ticket:', error);
      toast.error('Erreur lors de la création du ticket');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Ouvert
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <MessageSquare className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Résolu
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <XCircle className="h-3 w-3 mr-1" />
            Fermé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes tickets de support</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un ticket de support</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, subject: e.target.value })
                      }
                      placeholder="Décrivez brièvement votre problème"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value) =>
                          setNewTicket({ ...newTicket, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priorité</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value) =>
                          setNewTicket({ ...newTicket, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((pri) => (
                            <SelectItem key={pri.value} value={pri.value}>
                              {pri.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, description: e.target.value })
                      }
                      placeholder="Décrivez en détail votre problème..."
                      rows={5}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleCreateTicket}>Créer le ticket</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Vous n'avez aucun ticket de support
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Créer un ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Catégorie:{' '}
                        {categories.find((c) => c.value === ticket.category)
                          ?.label || ticket.category}
                      </span>
                      <span className={getPriorityColor(ticket.priority)}>
                        Priorité:{' '}
                        {priorities.find((p) => p.value === ticket.priority)
                          ?.label || ticket.priority}
                      </span>
                      <span>
                        Créé le{' '}
                        {format(new Date(ticket.created_at), 'dd/MM/yyyy à HH:mm', {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
