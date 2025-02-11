
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Profile = () => {
  const handleSave = () => {
    toast.success("Profil mis à jour avec succès");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" defaultValue="Jean" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" defaultValue="Dupont" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="jean.dupont@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" defaultValue="06 12 34 56 78" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Date de naissance</Label>
            <Input id="birthdate" type="date" defaultValue="1990-01-01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" defaultValue="123 rue de Paris" />
          </div>
        </div>
        <Button onClick={handleSave}>Sauvegarder les modifications</Button>
      </div>
    </div>
  );
};

export default Profile;
