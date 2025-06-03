
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Clock, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface QueueEntry {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  requestedDoctor: string;
  specialty: string;
  urgency: "urgent" | "normal" | "flexible";
  requestDate: string;
  preferredDates: string[];
  notes?: string;
}

export const WaitingQueue = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  
  const [queueEntries] = useState<QueueEntry[]>([
    {
      id: "1",
      patientName: "Marie Dubois",
      patientEmail: "marie.dubois@email.com",
      patientPhone: "01 23 45 67 89",
      requestedDoctor: "Dr. Martin",
      specialty: "Cardiologie",
      urgency: "urgent",
      requestDate: "2024-04-15",
      preferredDates: ["2024-04-20", "2024-04-21"],
      notes: "Patient avec antécédents cardiaques"
    },
    {
      id: "2",
      patientName: "Jean Dupont",
      patientEmail: "jean.dupont@email.com",
      patientPhone: "01 23 45 67 90",
      requestedDoctor: "Dr. Leroy",
      specialty: "Dermatologie",
      urgency: "normal",
      requestDate: "2024-04-14",
      preferredDates: ["2024-04-18", "2024-04-19", "2024-04-22"]
    },
    {
      id: "3",
      patientName: "Sophie Bernard",
      patientEmail: "sophie.bernard@email.com",
      patientPhone: "01 23 45 67 91",
      requestedDoctor: "Tout médecin disponible",
      specialty: "Médecine générale",
      urgency: "flexible",
      requestDate: "2024-04-13",
      preferredDates: ["2024-04-25", "2024-04-26", "2024-04-27"]
    }
  ]);

  const filteredEntries = queueEntries.filter(entry => {
    const matchesSearch = entry.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.requestedDoctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = urgencyFilter === "all" || entry.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const handleAssignSlot = (patientName: string, entryId: string) => {
    toast.success(`Recherche de créneaux disponibles pour ${patientName}`);
    // Ici on ouvrirait un modal pour sélectionner un créneau
  };

  const handleContactPatient = (patientName: string, method: "phone" | "email") => {
    toast.success(`Contact ${method === "phone" ? "téléphonique" : "par email"} avec ${patientName}`);
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
              placeholder="Rechercher un patient ou médecin..."
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
                      <h4 className="font-medium">{entry.patientName}</h4>
                      <Badge variant={getUrgencyColor(entry.urgency)}>
                        {getUrgencyLabel(entry.urgency)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Médecin souhaité:</span> {entry.requestedDoctor}</p>
                        <p><span className="font-medium">Spécialité:</span> {entry.specialty}</p>
                        <p><span className="font-medium">Demande du:</span> {entry.requestDate}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Téléphone:</span> {entry.patientPhone}</p>
                        <p><span className="font-medium">Email:</span> {entry.patientEmail}</p>
                        <p><span className="font-medium">Dates préférées:</span> {entry.preferredDates.join(", ")}</p>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Notes:</span> {entry.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" onClick={() => handleAssignSlot(entry.patientName, entry.id)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      Assigner créneau
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactPatient(entry.patientName, "phone")}>
                      <Phone className="h-3 w-3 mr-1" />
                      Appeler
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactPatient(entry.patientName, "email")}>
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
