
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserX, UserCheck, Mail, Shield, Eye, PenSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "blocked" | "pending";
  registeredDate: string;
  lastLogin: string;
  type: "patient" | "doctor" | "admin";
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    status: "active",
    registeredDate: "2024-01-15",
    lastLogin: "2024-04-10",
    type: "patient",
    avatar: "/placeholder.svg"
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
    type: "doctor",
    avatar: "/placeholder.svg"
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
    email: "admin@example.com",
    status: "active",
    registeredDate: "2023-12-08",
    lastLogin: "2024-04-15",
    type: "admin",
    avatar: "/placeholder.svg"
  },
  {
    id: "6",
    name: "Camille Richard",
    email: "camille.richard@example.com",
    status: "pending",
    registeredDate: "2024-04-01",
    lastLogin: "2024-04-01",
    type: "doctor"
  },
];

export const UsersTable = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users] = useState<User[]>(mockUsers);
  
  const handleSelectUser = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };
  
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleStatusChange = (userId: string, newStatus: "active" | "blocked") => {
    console.log(`Changing status for user ${userId} to ${newStatus}`);
    toast.success(`Le statut de l'utilisateur a été modifié avec succès`);
  };

  const handleContactUser = (email: string) => {
    console.log(`Contacting user at ${email}`);
    toast.success(`Un email va être envoyé à ${email}`);
  };
  
  const handleViewUser = (userId: string) => {
    console.log(`Viewing user details ${userId}`);
    toast.info(`Affichage des détails de l'utilisateur`);
  };
  
  const handleEditUser = (userId: string) => {
    console.log(`Editing user ${userId}`);
    toast.info(`Édition de l'utilisateur en cours`);
  };
  
  const handleDeleteUser = (userId: string) => {
    console.log(`Deleting user ${userId}`);
    toast.success(`L'utilisateur a été supprimé avec succès`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </TableCell>
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
                <Badge 
                  variant={
                    user.status === "active" ? "outline" : 
                    user.status === "blocked" ? "destructive" : "secondary"
                  }
                  className={
                    user.status === "active" ? "border-green-500 text-green-600 bg-green-50" : 
                    user.status === "blocked" ? "" : 
                    "border-yellow-500 text-yellow-600 bg-yellow-50"
                  }
                >
                  {user.status === "active" ? "Actif" : 
                   user.status === "blocked" ? "Bloqué" : "En attente"}
                </Badge>
              </TableCell>
              <TableCell>{user.registeredDate}</TableCell>
              <TableCell>{user.lastLogin}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleViewUser(user.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditUser(user.id)}>
                    <PenSquare className="h-4 w-4" />
                  </Button>
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
                      {user.type !== "admin" && (
                        <DropdownMenuItem onClick={() => toast.success("Droits d'administrateur accordés")}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Promouvoir Admin</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Supprimer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
