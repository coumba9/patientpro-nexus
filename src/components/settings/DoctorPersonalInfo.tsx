
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface DoctorPersonalInfoProps {
  settings: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    speciality: string;
    consultationDuration: string;
  };
  setSettings: (settings: any) => void;
}

export const DoctorPersonalInfo = ({ settings, setSettings }: DoctorPersonalInfoProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Informations professionnelles</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            value={settings.firstName}
            onChange={(e) =>
              setSettings({ ...settings, firstName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            value={settings.lastName}
            onChange={(e) =>
              setSettings({ ...settings, lastName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speciality">Spécialité</Label>
          <Input
            id="speciality"
            value={settings.speciality}
            onChange={(e) =>
              setSettings({ ...settings, speciality: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultationDuration">Durée de consultation (min)</Label>
          <Input
            id="consultationDuration"
            type="number"
            value={settings.consultationDuration}
            onChange={(e) =>
              setSettings({ ...settings, consultationDuration: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </div>
          </Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) =>
              setSettings({ ...settings, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Téléphone
            </div>
          </Label>
          <Input
            id="phone"
            value={settings.phone}
            onChange={(e) =>
              setSettings({ ...settings, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse du cabinet
            </div>
          </Label>
          <Input
            id="address"
            value={settings.address}
            onChange={(e) =>
              setSettings({ ...settings, address: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};
