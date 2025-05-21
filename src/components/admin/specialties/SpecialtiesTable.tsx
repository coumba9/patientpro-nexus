import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import AddSpecialtyDialog from "./AddSpecialtyDialog";
import EditSpecialtyDialog from "./EditSpecialtyDialog";
import DeleteSpecialtyDialog from "./DeleteSpecialtyDialog";
import { specialtyService } from "@/api";
import { Specialty } from "@/api/interfaces";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export { type Specialty } from "@/api/interfaces";

export const SpecialtiesTable = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);

  const fetchSpecialties = async () => {
    try {
      setIsLoading(true);
      const data = await specialtyService.getSpecialtyWithDoctorsCount();
      setSpecialties(data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      toast.error("Erreur lors du chargement des spécialités");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
    
    // Souscrire aux changements en temps réel
    const channel = supabase
      .channel('public:specialties')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'specialties' },
        () => {
          fetchSpecialties();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchSpecialties();
    toast.success("Spécialité ajoutée avec succès");
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedSpecialty(null);
    fetchSpecialties();
    toast.success("Spécialité mise à jour avec succès");
  };

  const handleDeleteSuccess = (id: string) => {
    setIsDeleteDialogOpen(false);
    setSelectedSpecialty(null);
    setSpecialties(specialties.filter(specialty => specialty.id !== id));
    toast.success("Spécialité supprimée avec succès");
  };

  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (specialty.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des spécialités..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" /> Ajouter une spécialité
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Chargement des spécialités...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Médecins</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpecialties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Aucune spécialité trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredSpecialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell className="max-w-md truncate">{specialty.description}</TableCell>
                    <TableCell>
                      <Badge variant={specialty.status === "active" ? "success" : "secondary"}>
                        {specialty.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{specialty.total_doctors || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedSpecialty(specialty);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedSpecialty(specialty);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isAddDialogOpen && (
        <AddSpecialtyDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleAddSuccess}
        />
      )}

      {isEditDialogOpen && selectedSpecialty && (
        <EditSpecialtyDialog
          specialty={selectedSpecialty}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {isDeleteDialogOpen && selectedSpecialty && (
        <DeleteSpecialtyDialog
          specialty={selectedSpecialty}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default SpecialtiesTable;
