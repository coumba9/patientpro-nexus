
import { useState } from "react";
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
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EditSpecialtyDialog from "./EditSpecialtyDialog";
import DeleteSpecialtyDialog from "./DeleteSpecialtyDialog";

// Types pour les spécialités
export interface Specialty {
  id: number;
  name: string;
  description: string;
  totalDoctors: number;
  status: "active" | "inactive";
  createdAt: string;
}

// Données de spécialités fictives
const mockSpecialties: Specialty[] = [
  {
    id: 1,
    name: "Cardiologie",
    description: "Traitement des maladies du cœur et des vaisseaux",
    totalDoctors: 12,
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Dermatologie",
    description: "Traitement des affections de la peau",
    totalDoctors: 8,
    status: "active",
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    name: "Pédiatrie",
    description: "Soins médicaux pour les enfants",
    totalDoctors: 15,
    status: "active",
    createdAt: "2024-01-05"
  },
  {
    id: 4,
    name: "Ophtalmologie",
    description: "Traitement des maladies des yeux",
    totalDoctors: 7,
    status: "active",
    createdAt: "2024-02-10"
  },
  {
    id: 5,
    name: "Psychiatrie",
    description: "Traitement des troubles mentaux",
    totalDoctors: 9,
    status: "active",
    createdAt: "2024-02-15"
  },
  {
    id: 6,
    name: "Radiologie",
    description: "Imagerie médicale pour le diagnostic",
    totalDoctors: 6,
    status: "inactive",
    createdAt: "2024-03-01"
  },
  {
    id: 7,
    name: "Orthopédie",
    description: "Traitement des troubles musculo-squelettiques",
    totalDoctors: 10,
    status: "active",
    createdAt: "2024-03-10"
  },
  {
    id: 8,
    name: "Neurologie",
    description: "Étude et traitement des troubles du système nerveux",
    totalDoctors: 8,
    status: "active",
    createdAt: "2024-03-15"
  }
];

interface SpecialtiesTableProps {
  searchQuery: string;
}

const SpecialtiesTable = ({ searchQuery }: SpecialtiesTableProps) => {
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>(mockSpecialties);
  
  // Filtrer les spécialités en fonction de la recherche
  const filteredSpecialties = specialties.filter(
    (specialty) => 
      specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDeleteSuccess = (id: number) => {
    setSpecialties(specialties.filter(s => s.id !== id));
    setDeletingSpecialty(null);
    toast.success("Spécialité supprimée avec succès");
  };

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
                  <TableCell>{specialty.description}</TableCell>
                  <TableCell>{specialty.totalDoctors}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={specialty.status === "active" ? "default" : "secondary"}
                      className={specialty.status === "active" ? "bg-green-500" : "bg-gray-500"}
                    >
                      {specialty.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{specialty.createdAt}</TableCell>
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
