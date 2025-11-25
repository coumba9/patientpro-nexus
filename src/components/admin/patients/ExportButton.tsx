
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { AdminPatient } from "@/hooks/useAdminPatients";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ExportButtonProps {
  patients: AdminPatient[];
}

export const ExportButton = ({ patients }: ExportButtonProps) => {
  const handleExport = () => {
    try {
      // Create CSV headers
      const headers = [
        "ID",
        "Prénom",
        "Nom",
        "Email",
        "Téléphone",
        "Date de naissance",
        "Genre",
        "Groupe sanguin",
        "Date d'inscription",
        "Nombre de rendez-vous",
        "Dernière visite",
        "Statut"
      ];

      // Create CSV rows
      const rows = patients.map(patient => [
        patient.id,
        patient.first_name || '',
        patient.last_name || '',
        patient.email || '',
        patient.phone_number || '',
        patient.birth_date ? format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: fr }) : '',
        patient.gender || '',
        patient.blood_type || '',
        format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: fr }),
        patient.appointment_count.toString(),
        patient.last_appointment ? format(new Date(patient.last_appointment), 'dd/MM/yyyy', { locale: fr }) : '',
        patient.status === 'active' ? 'Actif' : 'Inactif'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `patients_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Export de ${patients.length} patients réussi`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export des données");
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <FileText className="mr-2 h-4 w-4" />
      Exporter les données
    </Button>
  );
};
