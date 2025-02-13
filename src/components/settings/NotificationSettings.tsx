
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface NotificationSettingsProps {
  notifications: {
    email: boolean;
    sms: boolean;
  };
  setSettings: (settings: any) => void;
}

export const NotificationSettings = ({ notifications, setSettings }: NotificationSettingsProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Notifications par email</Label>
            <p className="text-sm text-gray-500">
              Recevoir les rappels de rendez-vous par email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={notifications.email}
            onCheckedChange={(checked) =>
              setSettings((prev: any) => ({
                ...prev,
                notifications: { ...prev.notifications, email: checked },
              }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifications">Notifications par SMS</Label>
            <p className="text-sm text-gray-500">
              Recevoir les rappels de rendez-vous par SMS
            </p>
          </div>
          <Switch
            id="sms-notifications"
            checked={notifications.sms}
            onCheckedChange={(checked) =>
              setSettings((prev: any) => ({
                ...prev,
                notifications: { ...prev.notifications, sms: checked },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};
