
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
import { useAdminPatients, AdminPatient } from "@/hooks/useAdminPatients";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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


export const PatientsTable = () => {
  const { patients, loading, updatePatientStatus } = useAdminPatients();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<AdminPatient | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
    const email = patient.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleStatusChange = async (patientId: string, newStatus: "active" | "inactive") => {
    setUpdatingStatus(patientId);
    const isActive = newStatus === "active";
    const success = await updatePatientStatus(patientId, isActive);
    setUpdatingStatus(null);
    
    if (success) {
      toast.success(`Statut du patient mis à jour avec succès`);
    } else {
      toast.error(`Erreur lors de la mise à jour du statut`);
    }
  };

  const handleViewMedicalRecord = (patientId: string) => {
    toast.info("Affichage du dossier médical");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
          {filteredPatients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Aucun patient trouvé
              </TableCell>
            </TableRow>
          ) : (
            filteredPatients.map((patient) => {
              const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Non renseigné';
              
              return (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{fullName}</TableCell>
                  <TableCell>
                    {patient.birth_date ? format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: fr }) : 'Non renseigné'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{patient.email || 'Non renseigné'}</div>
                      <div className="text-sm text-muted-foreground">{patient.phone_number || 'Non renseigné'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.last_appointment ? format(new Date(patient.last_appointment), 'dd/MM/yyyy', { locale: fr }) : 'Aucune visite'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'active' ? "success" : "secondary"}>
                      {patient.status === 'active' ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.appointment_count || 0}</TableCell>
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
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(patient.id, patient.status === "active" ? "inactive" : "active")}
                      disabled={updatingStatus === patient.id}
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      {updatingStatus === patient.id ? "Mise à jour..." : patient.status === "active" ? "Désactiver" : "Activer"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
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
