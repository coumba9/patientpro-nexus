
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import SpecialtiesTable from "@/components/admin/specialties/SpecialtiesTable";
import AddSpecialtyDialog from "@/components/admin/specialties/AddSpecialtyDialog";
import SpecialtyStats from "@/components/admin/specialties/SpecialtyStats";

const Specialties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const handleRefreshData = () => {
    toast.success("Actualisation des données en cours...");
  };

  const handleExportSpecialties = () => {
    toast.success("Export des spécialités en cours...");
  };

  const handleAddSpecialty = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddSuccess = () => {
    toast.success("Spécialité ajoutée avec succès");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Gestion des spécialités médicales</h1>
        
        {/* Statistiques des spécialités */}
        <SpecialtyStats />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Liste des spécialités</CardTitle>
              <CardDescription>
                Gérez les spécialités médicales disponibles sur la plateforme
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSpecialties}>
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
              <Button size="sm" onClick={handleAddSpecialty}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtres et recherche */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une spécialité..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Table des spécialités */}
              <SpecialtiesTable searchQuery={searchQuery} />
            </div>
          </CardContent>
        </Card>
        
        {/* Dialog pour ajouter une spécialité */}
        <AddSpecialtyDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
};

export default Specialties;
