
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";

export const SecuritySettings = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Sécurité</h3>
      </div>
      <div className="space-y-4">
        <Button variant="outline" className="w-full sm:w-auto">
          <Lock className="h-4 w-4 mr-2" />
          Changer le mot de passe
        </Button>
      </div>
    </div>
  );
};
