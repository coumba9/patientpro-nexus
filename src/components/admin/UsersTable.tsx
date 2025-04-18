
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserX, UserCheck, Mail, Filter } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "blocked";
  registeredDate: string;
  lastLogin: string;
  type: "patient" | "doctor" | "admin";
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    status: "active",
    registeredDate: "2024-01-15",
    lastLogin: "2024-04-10",
    type: "patient"
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    status: "blocked",
    registeredDate: "2024-02-20",
    lastLogin: "2024-03-28",
    type: "patient"
  },
  {
    id: "3",
    name: "Dr. Pierre Leroy",
    email: "pierre.leroy@example.com",
    status: "active",
    registeredDate: "2023-11-05",
    lastLogin: "2024-04-15",
    type: "doctor"
  },
  {
    id: "4",
    name: "Sophie Dubois",
    email: "sophie.dubois@example.com",
    status: "active",
    registeredDate: "2024-03-10",
    lastLogin: "2024-04-12",
    type: "patient"
  },
  {
    id: "5",
    name: "Lucas Bernard",
    email: "lucas.bernard@example.com",
    status: "blocked",
    registeredDate: "2023-12-08",
    lastLogin: "2024-02-25",
    type: "admin"
  },
];

export const UsersTable = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const filteredUsers = selectedType === "all" 
    ? mockUsers 
    : mockUsers.filter(user => user.type === selectedType);

  const handleStatusChange = (userId: string, newStatus: "active" | "blocked") => {
    console.log(`Changing status for user ${userId} to ${newStatus}`);
    toast.success(`Le statut de l'utilisateur a été modifié avec succès`);
  };

  const handleContactUser = (email: string) => {
    console.log(`Contacting user at ${email}`);
    toast.success(`Un email va être envoyé à ${email}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {selectedType === "all" ? "Tous les utilisateurs" : 
               selectedType === "patient" ? "Patients" :
               selectedType === "doctor" ? "Médecins" : "Administrateurs"}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type d'utilisateur</SelectLabel>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="doctor">Médecins</SelectItem>
              <SelectItem value="admin">Administrateurs</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    user.type === "patient" ? "default" :
                    user.type === "doctor" ? "secondary" : "destructive"
                  }
                >
                  {user.type === "patient" ? "Patient" :
                   user.type === "doctor" ? "Médecin" : "Admin"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "success" : "destructive"}>
                  {user.status === "active" ? "Actif" : "Bloqué"}
                </Badge>
              </TableCell>
              <TableCell>{user.registeredDate}</TableCell>
              <TableCell>{user.lastLogin}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status === "active" ? "blocked" : "active")}>
                      {user.status === "active" ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          <span>Bloquer</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          <span>Activer</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleContactUser(user.email)}>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Contacter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
