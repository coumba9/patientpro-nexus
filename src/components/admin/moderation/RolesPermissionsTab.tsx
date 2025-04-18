
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Key } from "lucide-react";
import { toast } from "sonner";
import { RoleFormDialog } from "./RoleFormDialog";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const roles = [
  {
    id: 1,
    name: "Admin",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: ["all"],
    userCount: 1
  },
  {
    id: 2,
    name: "Modérateur",
    description: "Gère le contenu et les signalements",
    permissions: ["moderate_content", "view_reports", "approve_doctors"],
    userCount: 2
  },
  {
    id: 3,
    name: "Support",
    description: "Assiste les utilisateurs",
    permissions: ["view_users", "view_reports"],
    userCount: 3
  },
];

export const RolesPermissionsTab = () => {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create");

  const handleCreateRole = () => {
    setRoleFormMode("create");
    setSelectedRole(null);
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setRoleFormMode("edit");
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = (roleId: number) => {
    toast.success(`Rôle #${roleId} supprimé avec succès`);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Rôles et permissions</h2>
        <Button onClick={handleCreateRole} className="flex items-center">
          <Key className="h-4 w-4 mr-1" />
          Nouveau rôle
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du rôle</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Utilisateurs</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>{role.userCount}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.includes("all") ? (
                    <Badge variant="outline" className="bg-gray-100">Toutes</Badge>
                  ) : (
                    role.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="bg-gray-100">
                        {perm}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  {role.name !== "Admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RoleFormDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        mode={roleFormMode}
        role={selectedRole}
      />
    </>
  );
};
