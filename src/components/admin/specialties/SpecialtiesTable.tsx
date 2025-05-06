
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EditSpecialtyDialog from "./EditSpecialtyDialog";
import DeleteSpecialtyDialog from "./DeleteSpecialtyDialog";
import { supabase } from "@/integrations/supabase/client";

// Types pour les spécialités
export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  total_doctors: number | null;
  status: "active" | "inactive";
  created_at: string;
}

interface SpecialtiesTableProps {
  searchQuery: string;
}

const SpecialtiesTable = ({ searchQuery }: SpecialtiesTableProps) => {
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch specialties from Supabase
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('specialties')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setSpecialties(data as Specialty[]);
      } catch (error: any) {
        console.error('Error fetching specialties:', error);
        setError(error.message);
        toast.error("Erreur lors du chargement des spécialités");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialties();
  }, []);
  
  // Filtrer les spécialités en fonction de la recherche
  const filteredSpecialties = specialties.filter(
    (specialty) => 
      specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (specialty.description && specialty.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
  };

  const handleDelete = (specialty: Specialty) => {
    setDeletingSpecialty(specialty);
  };

  const handleEditSuccess = (updatedSpecialty: Specialty) => {
    setSpecialties(specialties.map(s => s.id === updatedSpecialty.id ? updatedSpecialty : s));
    setEditingSpecialty(null);
    toast.success(`Spécialité "${updatedSpecialty.name}" mise à jour avec succès`);
  };

  const handleDeleteSuccess = (id: string) => {
    setSpecialties(specialties.filter(s => s.id !== id));
    setDeletingSpecialty(null);
    toast.success("Spécialité supprimée avec succès");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des spécialités...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Une erreur est survenue lors du chargement des données: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Médecins</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpecialties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Aucune spécialité trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredSpecialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell className="font-medium">{specialty.name}</TableCell>
                  <TableCell>{specialty.description || ""}</TableCell>
                  <TableCell>{specialty.total_doctors || 0}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={specialty.status === "active" ? "default" : "secondary"}
                      className={specialty.status === "active" ? "bg-green-500" : "bg-gray-500"}
                    >
                      {specialty.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(specialty.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(specialty)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(specialty)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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

      {/* Dialogs pour éditer et supprimer */}
      {editingSpecialty && (
        <EditSpecialtyDialog 
          specialty={editingSpecialty} 
          open={!!editingSpecialty}
          onOpenChange={(open) => !open && setEditingSpecialty(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {deletingSpecialty && (
        <DeleteSpecialtyDialog 
          specialty={deletingSpecialty} 
          open={!!deletingSpecialty}
          onOpenChange={(open) => !open && setDeletingSpecialty(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default SpecialtiesTable;
