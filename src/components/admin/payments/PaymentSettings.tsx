
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    paymentMethods: {
      creditCard: true,
      paytech: true,
      bankTransfer: false
    },
    pricing: {
      consultation: 50,
      teleconsultation: 40,
      emergency: 80
    },
    fees: {
      platformFee: 5,
      processingFee: 2.5
    }
  });

  const handleSave = () => {
    toast.success("Paramètres de paiement sauvegardés");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Méthodes de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="credit-card">Carte bancaire</Label>
            <Switch
              id="credit-card"
              checked={settings.paymentMethods.creditCard}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  paymentMethods: { ...prev.paymentMethods, creditCard: checked }
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="paytech">PayTech</Label>
            <Switch
              id="paytech"
              checked={settings.paymentMethods.paytech}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  paymentMethods: { ...prev.paymentMethods, paytech: checked }
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="bank-transfer">Virement bancaire</Label>
            <Switch
              id="bank-transfer"
              checked={settings.paymentMethods.bankTransfer}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  paymentMethods: { ...prev.paymentMethods, bankTransfer: checked }
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tarification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="consultation-price">Consultation (€)</Label>
              <Input
                id="consultation-price"
                type="number"
                value={settings.pricing.consultation}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, consultation: Number(e.target.value) }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="teleconsultation-price">Téléconsultation (€)</Label>
              <Input
                id="teleconsultation-price"
                type="number"
                value={settings.pricing.teleconsultation}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, teleconsultation: Number(e.target.value) }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="emergency-price">Urgence (€)</Label>
              <Input
                id="emergency-price"
                type="number"
                value={settings.pricing.emergency}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, emergency: Number(e.target.value) }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frais de plateforme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform-fee">Frais de plateforme (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                step="0.1"
                value={settings.fees.platformFee}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    fees: { ...prev.fees, platformFee: Number(e.target.value) }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="processing-fee">Frais de traitement (%)</Label>
              <Input
                id="processing-fee"
                type="number"
                step="0.1"
                value={settings.fees.processingFee}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    fees: { ...prev.fees, processingFee: Number(e.target.value) }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Sauvegarder les paramètres</Button>
      </div>
    </div>
  );
};
