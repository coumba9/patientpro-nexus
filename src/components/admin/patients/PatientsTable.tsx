
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreVertical, FileText, UserCog } from "lucide-react";
import { PatientDetailsDialog } from "./PatientDetailsDialog";
import { PatientFilters } from "./PatientFilters";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: "active" | "inactive";
  appointments: number;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Fatou Diallo",
    birthDate: "1985-03-15",
    email: "fatou.diallo@example.com",
    phone: "+221 77 123 45 67",
    lastVisit: "2024-03-20",
    status: "active",
    appointments: 8
  },
  {
    id: "2",
    name: "Moussa Sow",
    birthDate: "1990-07-22",
    email: "moussa.sow@example.com",
    phone: "+221 76 234 56 78",
    lastVisit: "2024-04-05",
    status: "active",
    appointments: 3
  },
  {
    id: "3",
    name: "Aminata Ndiaye",
    birthDate: "1978-11-30",
    email: "aminata.ndiaye@example.com",
    phone: "+221 70 345 67 89",
    lastVisit: "2024-02-15",
    status: "inactive",
    appointments: 12
  }
];

export const PatientsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (patientId: string, newStatus: "active" | "inactive") => {
    toast.success(`Statut du patient mis à jour`);
  };

  const handleViewMedicalRecord = (patientId: string) => {
    toast.info("Affichage du dossier médical");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        <PatientFilters />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Date de naissance</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Dernière visite</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Rendez-vous</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.birthDate}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div>{patient.email}</div>
                  <div className="text-sm text-muted-foreground">{patient.phone}</div>
                </div>
              </TableCell>
              <TableCell>{patient.lastVisit}</TableCell>
              <TableCell>
                <Badge variant={patient.status === "active" ? "success" : "secondary"}>
                  {patient.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell>{patient.appointments}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedPatient(patient);
                      setIsDetailsOpen(true);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewMedicalRecord(patient.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Dossier médical
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(patient.id, patient.status === "active" ? "inactive" : "active")}>
                      <UserCog className="mr-2 h-4 w-4" />
                      {patient.status === "active" ? "Désactiver" : "Activer"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedPatient && (
        <PatientDetailsDialog
          patient={selectedPatient}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </div>
  );
};
