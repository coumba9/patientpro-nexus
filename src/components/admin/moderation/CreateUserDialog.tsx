import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, UserCheck, Mail, Lock, Briefcase, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const userFormSchema = z.object({
  first_name: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(80),
  last_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  email: z.string().trim().email("Email invalide"),
  role: z.enum(["patient", "doctor", "admin"]),
  phone_number: z.string().trim().max(30).optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72)
    .optional()
    .or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (payload: {
    email: string;
    first_name: string;
    last_name: string;
    role: "admin" | "doctor" | "patient";
    password?: string;
    phone_number?: string;
  }) => Promise<{ user_id: string; generated_password?: string }>;
}

export const CreateUserDialog = ({ open, onOpenChange, onCreate }: CreateUserDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "patient",
      phone_number: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    if (!onCreate) {
      toast.error("Création indisponible pour le moment");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await onCreate({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        password: data.password ? data.password : undefined,
        phone_number: data.phone_number ? data.phone_number : undefined,
      });

      if (result?.generated_password) {
        setGeneratedPassword(result.generated_password);
      } else {
        onOpenChange(false);
      }
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const close = () => {
    setGeneratedPassword(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer un nouveau compte utilisateur
          </DialogTitle>
          <DialogDescription>
            Le compte est activé immédiatement et la personne peut se connecter avec son email.
          </DialogDescription>
        </DialogHeader>

        {generatedPassword ? (
          <div className="space-y-4">
            <p className="text-sm">
              Compte créé. Transmettez ce mot de passe provisoire à la personne concernée, il ne sera plus affiché :
            </p>
            <div className="rounded-md border p-3 font-mono text-sm break-all">{generatedPassword}</div>
            <div className="flex justify-end">
              <Button onClick={close}>Terminé</Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Awa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Diop" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="awa@example.com" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="doctor">Médecin</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone (optionnel)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="221770000000" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe (optionnel)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Laissez vide pour générer automatiquement un mot de passe provisoire.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Créer l'utilisateur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
