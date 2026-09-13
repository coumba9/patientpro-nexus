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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserX, UserCheck, Mail, Shield, Eye, PenSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AdminUser } from "@/hooks/useAdminUsers";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  selectedUsers: string[];
  onSelectionChange: (ids: string[]) => void;
  onUpdateStatus: (userId: string, isBlocked: boolean) => Promise<void>;
  onUpdateRole: (userId: string, role: "admin" | "doctor" | "patient") => Promise<void>;
  onUpdateProfile: (
    userId: string,
    data: { first_name: string; last_name: string; email?: string; phone_number?: string }
  ) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const UsersTable = ({
  users,
  loading,
  selectedUsers,
  onSelectionChange,
  onUpdateStatus,
  onUpdateRole,
  onUpdateProfile,
  onDeleteUser,
}: UsersTableProps) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone_number: "" });
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelectUser = (userId: string, isChecked: boolean) => {
    onSelectionChange(
      isChecked ? [...selectedUsers, userId] : selectedUsers.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    onSelectionChange(isChecked ? users.map((u) => u.id) : []);
  };

  const run = async (userId: string, fn: () => Promise<void>) => {
    setBusyId(userId);
    try {
      await fn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
    });
  };

  const submitEdit = async () => {
    if (!editUser) return;
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      toast.error("Le prénom et le nom sont obligatoires");
      return;
    }
    setSaving(true);
    try {
      await onUpdateProfile(editUser.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim() || undefined,
        phone_number: editForm.phone_number.trim() || undefined,
      });
      setEditUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  const formatDateTime = (value: string | null) =>
    value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : null;

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
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
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Aucun utilisateur ne correspond à votre recherche
              </TableCell>
            </TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user.id} className={busyId === user.id ? "opacity-50" : undefined}>
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
                    <span className="font-medium">
                      {`${user.first_name || ""} ${user.last_name || ""}`.trim() || "Non renseigné"}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.email || "Non renseigné"}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === "patient" ? "default" : user.role === "doctor" ? "secondary" : "destructive"
                  }
                >
                  {user.role === "patient" ? "Patient" : user.role === "doctor" ? "Médecin" : "Admin"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === "active" ? "outline" : user.status === "blocked" ? "destructive" : "secondary"
                  }
                  className={
                    user.status === "active"
                      ? "border-green-500 text-green-600 bg-green-50"
                      : user.status === "blocked"
                      ? ""
                      : "border-yellow-500 text-yellow-600 bg-yellow-50"
                  }
                >
                  {user.status === "active" ? "Actif" : user.status === "blocked" ? "Bloqué" : "En attente"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "N/A"}
              </TableCell>
              <TableCell>{formatDateTime(user.last_login) || "Jamais"}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => setViewUser(user)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={busyId === user.id}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => run(user.id, () => onUpdateStatus(user.id, user.status !== "blocked"))}
                      >
                        {user.status !== "blocked" ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Bloquer</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Débloquer</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (user.email) window.location.href = `mailto:${user.email}`;
                          else toast.error("Aucune adresse email pour cet utilisateur");
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Contacter</span>
                      </DropdownMenuItem>
                      {user.role !== "admin" && (
                        <DropdownMenuItem onClick={() => setPromoteTarget(user)}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Promouvoir Admin</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(user)}
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

      {/* Fiche utilisateur */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Nom : </span>
                {`${viewUser.first_name || ""} ${viewUser.last_name || ""}`.trim() || "Non renseigné"}
              </p>
              <p>
                <span className="text-muted-foreground">Email : </span>
                {viewUser.email || "Non renseigné"}
              </p>
              <p>
                <span className="text-muted-foreground">Téléphone : </span>
                {viewUser.phone_number || "Non renseigné"}
              </p>
              <p>
                <span className="text-muted-foreground">Rôle : </span>
                {viewUser.role}
              </p>
              <p>
                <span className="text-muted-foreground">Statut : </span>
                {viewUser.status === "active" ? "Actif" : viewUser.status === "blocked" ? "Bloqué" : "En attente"}
              </p>
              <p>
                <span className="text-muted-foreground">Inscription : </span>
                {viewUser.created_at ? new Date(viewUser.created_at).toLocaleString("fr-FR") : "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">Dernière connexion : </span>
                {formatDateTime(viewUser.last_login) || "Jamais"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modification */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>Les modifications sont appliquées immédiatement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-first">Prénom</Label>
              <Input
                id="edit-first"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-last">Nom</Label>
              <Input
                id="edit-last"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone_number}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={submitEdit} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suppression */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le compte de {deleteTarget?.email || "cet utilisateur"} et ses données
              associées seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) run(target.id, () => onDeleteUser(target.id));
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promotion admin */}
      <AlertDialog open={!!promoteTarget} onOpenChange={(open) => !open && setPromoteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promouvoir en administrateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {promoteTarget?.email || "Cet utilisateur"} aura accès à toute l'administration de la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = promoteTarget;
                setPromoteTarget(null);
                if (target) run(target.id, () => onUpdateRole(target.id, "admin"));
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTable;
