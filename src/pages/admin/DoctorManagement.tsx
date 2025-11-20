
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  UserX,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminDoctors } from "@/hooks/useAdminDoctors";

const DoctorManagement = () => {
  const { doctors, loading } = useAdminDoctors();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Fonction pour filtrer les médecins
  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && doctor.is_verified) ||
                         (statusFilter === "pending" && !doctor.is_verified);
    const matchesSpecialty = specialtyFilter === "all" || doctor.specialty_name === specialtyFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialty;
  });
  
  // Fonction pour changer le statut d'un médecin
  const changeStatus = (doctorId, newStatus) => {
    // Dans une application réelle, cela ferait une requête API
    toast.success(`Statut du médecin modifié avec succès`);
  };
  
  // Fonction pour afficher les détails d'un médecin
  const showDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Gestion des médecins</h2>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un médecin..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes spécialités</SelectItem>
                  <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                  <SelectItem value="Dermatologie">Dermatologie</SelectItem>
                  <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                  <SelectItem value="Psychiatrie">Psychiatrie</SelectItem>
                  <SelectItem value="Ophtalmologie">Ophtalmologie</SelectItem>
                  <SelectItem value="Neurologie">Neurologie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tableau des médecins */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Chargement...</TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Aucun médecin trouvé</TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        {doctor.first_name} {doctor.last_name}
                      </TableCell>
                      <TableCell>{doctor.specialty_name || "Non spécifié"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={doctor.is_verified ? "default" : "secondary"}
                        >
                          {doctor.is_verified ? "Actif" : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => showDoctorDetails(doctor)}>
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!doctor.is_verified ? (
                              <DropdownMenuItem onClick={() => changeStatus(doctor.id, "active")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Activer
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => changeStatus(doctor.id, "suspended")}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Suspendre
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {filteredDoctors.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Aucun médecin trouvé avec les filtres sélectionnés
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de détails du médecin */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Détails du médecin</DialogTitle>
            <DialogDescription>
              Informations complètes et gestion du profil
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{selectedDoctor.first_name} {selectedDoctor.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Spécialité</p>
                  <p className="font-medium">{selectedDoctor.specialty_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedDoctor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{selectedDoctor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <Badge 
                    variant={
                      selectedDoctor.status === "active" ? "success" : 
                      selectedDoctor.status === "pending" ? "warning" : 
                      "destructive"
                    }
                  >
                    {selectedDoctor.status === "active" && "Actif"}
                    {selectedDoctor.status === "pending" && "En attente"}
                    {selectedDoctor.status === "suspended" && "Suspendu"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de vérification</p>
                  <p className="font-medium">{selectedDoctor.verificationDate || "Non vérifié"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre de patients</p>
                  <p className="font-medium">{selectedDoctor.patients}</p>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between items-center gap-2 mt-6">
                {selectedDoctor.status !== "active" && (
                  <Button 
                    onClick={() => {
                      changeStatus(selectedDoctor.id, "active");
                      setIsDetailsOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activer ce médecin
                  </Button>
                )}
                {selectedDoctor.status !== "suspended" && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      changeStatus(selectedDoctor.id, "suspended");
                      setIsDetailsOpen(false);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Suspendre ce médecin
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorManagement;
