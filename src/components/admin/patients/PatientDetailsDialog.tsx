
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, User } from "lucide-react";

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

interface PatientDetailsDialogProps {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatientDetailsDialog = ({
  patient,
  open,
  onOpenChange,
}: PatientDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails du patient
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={patient.status === "active" ? "success" : "secondary"}>
                {patient.status === "active" ? "Actif" : "Inactif"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: {patient.id}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Informations personnelles</Label>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contact</Label>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statistiques</Label>
              <div className="rounded-lg border p-4 space-y-3">
                <div>Dernière visite : {patient.lastVisit}</div>
                <div>Nombre total de rendez-vous : {patient.appointments}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
