import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { AdminPatient } from "@/hooks/useAdminPatients";
import { AdminExportDialog } from "@/components/admin/export/AdminExportDialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ExportButtonProps {
  patients: AdminPatient[];
}

const columns = [
  { key: "first_name", label: "Prénom" },
  { key: "last_name", label: "Nom" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Téléphone" },
  { key: "birth_date", label: "Date de naissance" },
  { key: "gender", label: "Genre" },
  { key: "blood_type", label: "Groupe sanguin" },
  { key: "created_at", label: "Date d'inscription" },
  { key: "appointment_count", label: "Rendez-vous" },
  { key: "status", label: "Statut" },
];

export const ExportButton = ({ patients }: ExportButtonProps) => {
  const [open, setOpen] = useState(false);

  const fetchData = async (startDate: Date | undefined, endDate: Date | undefined) => {
    // Filter from already-loaded patients data
    let filtered = patients;
    if (startDate) {
      filtered = filtered.filter((p) => new Date(p.created_at) >= startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((p) => new Date(p.created_at) <= end);
    }
    return filtered.map((p) => ({
      first_name: p.first_name || "",
      last_name: p.last_name || "",
      email: p.email || "",
      phone_number: p.phone_number || "",
      birth_date: p.birth_date ? format(new Date(p.birth_date), "dd/MM/yyyy", { locale: fr }) : "",
      gender: p.gender || "",
      blood_type: p.blood_type || "",
      created_at: format(new Date(p.created_at), "dd/MM/yyyy", { locale: fr }),
      appointment_count: p.appointment_count,
      status: p.status === "active" ? "Actif" : "Inactif",
    }));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Exporter les données
      </Button>
      <AdminExportDialog
        open={open}
        onOpenChange={setOpen}
        title="Exporter les patients"
        columns={columns}
        fetchData={fetchData}
        filePrefix="patients_export"
      />
    </>
  );
};
