import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Eye, Filter, Edit, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { CreateUserDialog } from "./CreateUserDialog";
import { useAdminUsers, AdminUser } from "@/hooks/useAdminUsers";
import { Skeleton } from "@/components/ui/skeleton";

export const UsersManagementTab = () => {
  const { users, loading } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((user) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Apply role filter
    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  }, [users, searchQuery, roleFilter]);

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
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
          {filteredUsers.map((user) => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Non renseigné';
            const formattedDate = user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A';
            
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{fullName}</TableCell>
                <TableCell>{user.email || 'Non renseigné'}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "destructive" : user.role === "doctor" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : user.role === "doctor" ? "Médecin" : "Patient"}
                  </Badge>
                </TableCell>
                <TableCell>{formattedDate}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "outline" : "secondary"}>
                    {user.status === "active" ? "Actif" : user.status === "pending" ? "En attente" : "Bloqué"}
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
          );
        })}
        </TableBody>
      </Table>

      <UserDetailsDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser ? {
          id: parseInt(selectedUser.id),
          name: `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Non renseigné',
          email: selectedUser.email || '',
          role: selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'doctor' ? 'Médecin' : 'Patient',
          dateAdded: selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR') : 'N/A',
          status: selectedUser.status === 'active' ? 'Actif' : selectedUser.status === 'pending' ? 'En attente' : 'Bloqué',
          permissions: selectedUser.role === 'admin' ? ['all'] : []
        } : null}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};
