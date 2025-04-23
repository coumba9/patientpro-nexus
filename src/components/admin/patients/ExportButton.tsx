
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export const ExportButton = () => {
  const handleExport = () => {
    // Simulation de l'export
    toast.success("Export des données patients en cours...");
    // Ici on pourrait implémenter l'export réel vers CSV/Excel
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <FileText className="mr-2 h-4 w-4" />
      Exporter les données
    </Button>
  );
};
