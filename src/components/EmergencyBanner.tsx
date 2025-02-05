import { Phone } from "lucide-react";

export const EmergencyBanner = () => {
  return (
    <div className="bg-destructive text-white py-3">
      <div className="container flex items-center justify-center gap-2">
        <Phone className="h-5 w-5 animate-pulse" />
        <span className="font-medium">
          En cas d'urgence, appelez le 15 ou le 112
        </span>
      </div>
    </div>
  );
};