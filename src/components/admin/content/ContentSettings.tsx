
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const ContentSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "DocConnect",
    siteDescription: "Plateforme de prise de rendez-vous médicaux",
    contactEmail: "contact@docconnect.com",
    supportPhone: "+221 77 123 45 67",
    maintenanceMode: false,
    allowRegistration: true,
    moderateComments: true
  });

  const handleSave = () => {
    toast.success("Paramètres du contenu sauvegardés");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">Nom du site</Label>
            <Input
              id="site-name"
              value={settings.siteName}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, siteName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="site-description">Description du site</Label>
            <Textarea
              id="site-description"
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, siteDescription: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contact-email">Email de contact</Label>
            <Input
              id="contact-email"
              type="email"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, contactEmail: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="support-phone">Téléphone de support</Label>
            <Input
              id="support-phone"
              value={settings.supportPhone}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, supportPhone: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode">Mode maintenance</Label>
            <Switch
              id="maintenance-mode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, maintenanceMode: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-registration">Autoriser les inscriptions</Label>
            <Switch
              id="allow-registration"
              checked={settings.allowRegistration}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, allowRegistration: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="moderate-comments">Modération des commentaires</Label>
            <Switch
              id="moderate-comments"
              checked={settings.moderateComments}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, moderateComments: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Sauvegarder les paramètres</Button>
      </div>
    </div>
  );
};
