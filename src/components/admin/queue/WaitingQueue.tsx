
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { notificationService, QueueEntryData } from "@/api/services/notification.service";

export const WaitingQueue = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [queueEntries, setQueueEntries] = useState<QueueEntryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueueEntries();
  }, []);

  const loadQueueEntries = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getQueueEntries();
      setQueueEntries(data);
    } catch (error) {
      console.error('Error loading queue entries:', error);
      toast.error('Erreur lors du chargement de la file d\'attente');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = queueEntries.filter(entry => {
    const matchesUrgency = urgencyFilter === "all" || entry.urgency === urgencyFilter;
    return matchesUrgency;
  });

  const handleAssignSlot = async (entryId: string) => {
    try {
      await notificationService.updateQueueEntryStatus(entryId, "assigned");
      toast.success(`Créneau assigné avec succès`);
      loadQueueEntries(); // Recharger les données
    } catch (error) {
      console.error('Error assigning slot:', error);
      toast.error('Erreur lors de l\'assignation du créneau');
    }
  };

  const handleContactPatient = (method: "phone" | "email") => {
    toast.success(`Contact ${method === "phone" ? "téléphonique" : "par email"} initié`);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "destructive";
      case "normal": return "secondary";
      case "flexible": return "outline";
      default: return "outline";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "Urgent";
      case "normal": return "Normal";
      case "flexible": return "Flexible";
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement de la file d'attente...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          File d'attente ({queueEntries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes urgences</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Patient ID: {entry.patient_id}</h4>
                      <Badge variant={getUrgencyColor(entry.urgency)}>
                        {getUrgencyLabel(entry.urgency)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Médecin souhaité:</span> {entry.requested_doctor_id || "N/A"}</p>
                        <p><span className="font-medium">Spécialité:</span> {entry.specialty_id || "N/A"}</p>
                        <p><span className="font-medium">Demande du:</span> {new Date(entry.created_at!).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Statut:</span> {entry.status}</p>
                        <p><span className="font-medium">Dates préférées:</span> {entry.preferred_dates?.join(", ") || "N/A"}</p>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Notes:</span> {entry.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" onClick={() => handleAssignSlot(entry.id)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      Assigner créneau
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactPatient("phone")}>
                      <Phone className="h-3 w-3 mr-1" />
                      Appeler
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactPatient("email")}>
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun patient en file d'attente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
