
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
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Skeleton } from "@/components/ui/skeleton";

export const UsersTable = () => {
  const { users, loading } = useAdminUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
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

  const handleStatusChange = async (userId: string, newStatus: "active" | "blocked") => {
    try {
      // TODO: Implement API call to change user status
      // await userService.updateStatus(userId, newStatus);
      toast.success(`Le statut de l'utilisateur a été modifié avec succès`);
    } catch (error) {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const handleContactUser = async (email: string) => {
    try {
      // TODO: Implement email service
      // await emailService.sendAdminEmail(email, subject, message);
      toast.success(`Un email va être envoyé à ${email}`);
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };
  
  const handleViewUser = (userId: string) => {
    // TODO: Implement user details dialog/page
    toast.info(`Fonction de visualisation en cours de développement`);
  };
  
  const handleEditUser = (userId: string) => {
    // TODO: Implement user edit dialog/form
    toast.info(`Fonction d'édition en cours de développement`);
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      // TODO: Implement API call to delete user
      // await userService.delete(userId);
      toast.success(`L'utilisateur a été supprimé avec succès`);
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    try {
      // TODO: Implement API call to promote user to admin
      // await userService.promoteToAdmin(userId);
      toast.success("Droits d'administrateur accordés avec succès");
    } catch (error) {
      toast.error("Erreur lors de la promotion");
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '??';
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
                    <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Non renseigné'}</span>
                    <span className="text-xs text-muted-foreground">{user.email || 'Non renseigné'}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    user.role === "patient" ? "default" :
                    user.role === "doctor" ? "secondary" : "destructive"
                  }
                >
                  {user.role === "patient" ? "Patient" :
                   user.role === "doctor" ? "Médecin" : "Admin"}
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
              <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
              <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}</TableCell>
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
                      <DropdownMenuItem onClick={() => user.email && handleContactUser(user.email)}>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Contacter</span>
                      </DropdownMenuItem>
                      {user.role !== "admin" && (
                        <DropdownMenuItem onClick={() => handlePromoteAdmin(user.id)}>
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
