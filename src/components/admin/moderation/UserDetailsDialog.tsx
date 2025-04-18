
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  dateAdded: string;
  status: string;
  permissions: string[];
}

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const availablePermissions = [
  { id: "view_users", label: "Voir les utilisateurs" },
  { id: "edit_users", label: "Modifier les utilisateurs" },
  { id: "delete_users", label: "Supprimer les utilisateurs" },
  { id: "view_reports", label: "Voir les signalements" },
  { id: "moderate_content", label: "Modérer le contenu" },
  { id: "approve_doctors", label: "Approuver les médecins" },
  { id: "edit_content", label: "Éditer le contenu" },
  { id: "view_analytics", label: "Voir les statistiques" },
  { id: "manage_roles", label: "Gérer les rôles" },
  { id: "all", label: "Toutes les permissions" },
];

export const UserDetailsDialog = ({ open, onOpenChange, user }: UserDetailsDialogProps) => {
  if (!user) return null;

  const handleUpdateRole = (role: string) => {
    toast.success(`Rôle mis à jour avec succès`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Détails de l'utilisateur
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <Badge 
                  className="mt-2" 
                  variant={user.role === "Admin" ? "destructive" : user.role === "Modérateur" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rôle actuel</h3>
                  <Select defaultValue={user.role} onValueChange={handleUpdateRole}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Rôles disponibles</SelectLabel>
                        <SelectItem value="Admin">Administrateur</SelectItem>
                        <SelectItem value="Modérateur">Modérateur</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Permissions</h3>
                  <div className="space-y-2">
                    {user.permissions.includes("all") ? (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Toutes les permissions</p>
                            <p className="text-sm text-gray-500">Accès complet à l'ensemble du système</p>
                          </div>
                          <ShieldCheck className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    ) : (
                      user.permissions.map((permission) => (
                        <div key={permission} className="p-3 bg-gray-50 rounded-md">
                          <p className="font-medium">
                            {availablePermissions.find(p => p.id === permission)?.label || permission}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Statut du compte</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compte actif</p>
                      <p className="text-sm text-gray-500">L'utilisateur peut se connecter à la plateforme</p>
                    </div>
                    <Switch checked={user.status === "Actif"} />
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            Sauvegarder les modifications
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
