
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Video } from "lucide-react";

interface TeleconsultationSettingsProps {
  teleconsultation: {
    enabled: boolean;
    automaticReminders: boolean;
  };
  setSettings: (settings: any) => void;
}

export const TeleconsultationSettings = ({ teleconsultation, setSettings }: TeleconsultationSettingsProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Téléconsultation</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="teleconsultation-enabled">Activer la téléconsultation</Label>
            <p className="text-sm text-gray-500">
              Permettre aux patients de prendre des rendez-vous en téléconsultation
            </p>
          </div>
          <Switch
            id="teleconsultation-enabled"
            checked={teleconsultation.enabled}
            onCheckedChange={(checked) =>
              setSettings((prev: any) => ({
                ...prev,
                teleconsultation: { ...prev.teleconsultation, enabled: checked },
              }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="automatic-reminders">Rappels automatiques</Label>
            <p className="text-sm text-gray-500">
              Envoyer des rappels automatiques avant la téléconsultation
            </p>
          </div>
          <Switch
            id="automatic-reminders"
            checked={teleconsultation.automaticReminders}
            onCheckedChange={(checked) =>
              setSettings((prev: any) => ({
                ...prev,
                teleconsultation: {
                  ...prev.teleconsultation,
                  automaticReminders: checked,
                },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};
