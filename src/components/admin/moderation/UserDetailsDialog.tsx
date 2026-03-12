import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Trash2, Save, Loader2 } from "lucide-react";
import { AdminUser } from "@/hooks/useAdminUsers";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onUpdateRole: (userId: string, role: 'admin' | 'doctor' | 'patient') => Promise<void>;
  onUpdateStatus: (userId: string, isBlocked: boolean) => Promise<void>;
  onUpdateProfile: (userId: string, data: { first_name: string; last_name: string; email?: string; phone_number?: string }) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export const UserDetailsDialog = ({ open, onOpenChange, user, onUpdateRole, onUpdateStatus, onUpdateProfile, onDelete }: UserDetailsDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // Sync state when user changes
  const initState = () => {
    if (!user) return;
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setEmail(user.email || "");
    setPhone(user.phone_number || "");
    setRole(user.role);
    setIsActive(user.status !== "blocked");
  };

  // Use onOpenChange to reset
  const handleOpenChange = (v: boolean) => {
    if (v && user) initState();
    onOpenChange(v);
  };

  // Also init when dialog opens with user
  if (open && user && role === "" && firstName === "" && lastName === "") {
    initState();
  }

  if (!user) return null;

  const hasProfileChanges = firstName !== (user.first_name || "") || lastName !== (user.last_name || "") || email !== (user.email || "") || phone !== (user.phone_number || "");
  const hasRoleChange = role !== user.role;
  const hasStatusChange = isActive !== (user.status !== "blocked");
  const hasChanges = hasProfileChanges || hasRoleChange || hasStatusChange;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (hasProfileChanges) {
        await onUpdateProfile(user.id, { first_name: firstName, last_name: lastName, email: email || undefined, phone_number: phone || undefined });
      }
      if (hasRoleChange) {
        await onUpdateRole(user.id, role as 'admin' | 'doctor' | 'patient');
      }
      if (hasStatusChange) {
        await onUpdateStatus(user.id, !isActive);
      }
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(user.id);
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Détails de l'utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{firstName} {lastName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Badge className="ml-auto" variant={user.role === "admin" ? "destructive" : user.role === "doctor" ? "default" : "secondary"}>
              {user.role === "admin" ? "Admin" : user.role === "doctor" ? "Médecin" : "Patient"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prénom</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Médecin</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium text-sm">Compte actif</p>
              <p className="text-xs text-muted-foreground">L'utilisateur peut se connecter</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le compte de {firstName} {lastName} sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
