
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role: Role | null;
}

const roleFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du rôle doit contenir au moins 2 caractères",
  }),
  permissions: z.array(z.string()).min(1, {
    message: "Sélectionnez au moins une permission",
  }),
});

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

export const RoleFormDialog = ({ open, onOpenChange, mode, role }: RoleFormDialogProps) => {
  const form = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || "",
      permissions: role?.permissions || [],
    },
  });

  const onSubmit = (data: z.infer<typeof roleFormSchema>) => {
    if (mode === "create") {
      toast.success(`Nouveau rôle "${data.name}" créé avec succès`);
    } else {
      toast.success(`Rôle "${data.name}" mis à jour avec succès`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {mode === "create" ? "Créer un nouveau rôle" : "Modifier le rôle"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Nom du rôle</Label>
                  <FormControl>
                    <Input placeholder="Ex: Modérateur senior" {...field} />
                  </FormControl>
                  <FormDescription>
                    Un nom descriptif pour ce rôle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label className="block mb-2">Permissions</Label>
              <div className="space-y-2 border rounded-md p-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={form.watch("permissions")?.includes(permission.id)}
                      onChange={(e) => {
                        const current = form.watch("permissions") || [];
                        if (permission.id === "all") {
                          if (e.target.checked) {
                            form.setValue("permissions", ["all"]);
                          } else {
                            form.setValue("permissions", []);
                          }
                        } else {
                          const newPermissions = e.target.checked
                            ? [...current.filter(p => p !== "all"), permission.id]
                            : current.filter(p => p !== permission.id);
                          form.setValue("permissions", newPermissions);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`permission-${permission.id}`}>{permission.label}</Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.permissions && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.permissions.message}
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {mode === "create" ? "Créer le rôle" : "Sauvegarder les modifications"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
