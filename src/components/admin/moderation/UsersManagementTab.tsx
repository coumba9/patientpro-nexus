import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, Filter, Edit, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { CreateUserDialog } from "./CreateUserDialog";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  dateAdded: string;
  permissions: string[];
}

const users = [
  {
    id: 1,
    name: "Aissatou Diallo",
    email: "aissatou.diallo@example.com",
    role: "Admin",
    dateAdded: "2024-01-05",
    status: "Actif",
    permissions: ["all"]
  },
  {
    id: 2,
    name: "Mamadou Sow",
    email: "mamadou.sow@example.com",
    role: "Modérateur",
    dateAdded: "2024-01-15",
    status: "Actif",
    permissions: ["moderate_content", "view_reports", "approve_doctors"]
  },
  {
    id: 3,
    name: "Fatou Ndiaye",
    email: "fatou.ndiaye@example.com",
    role: "Support",
    dateAdded: "2024-02-01",
    status: "Actif",
    permissions: ["view_users", "view_reports"]
  },
];

export const UsersManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.role.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    if (!role || role === "all") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => user.role === role);
      setFilteredUsers(filtered);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau compte
          </Button>
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64 pl-9"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-40">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <span>{roleFilter || "Filtrer par rôle"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="doctor">Médecins</SelectItem>
              <SelectItem value="secretary">Secrétaires</SelectItem>
              <SelectItem value="admin">Administrateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "Admin" ? "destructive" : user.role === "Modérateur" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{user.dateAdded}</TableCell>
              <TableCell>
                <Badge variant={user.status === "Actif" ? "outline" : "secondary"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 shadow-sm hover:shadow"
                    onClick={() => handleViewUser(user)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserDetailsDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};
