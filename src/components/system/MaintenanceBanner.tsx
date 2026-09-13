import { AlertTriangle } from "lucide-react";
import { usePublicSettings } from "@/hooks/useSystemSettings";

/** Bandeau affiché sur tout le site lorsque le mode maintenance est activé par un administrateur. */
export const MaintenanceBanner = () => {
  const { maintenanceMode, isLoading } = usePublicSettings();

  if (isLoading || !maintenanceMode) return null;

  return (
    <div className="w-full bg-destructive text-destructive-foreground px-4 py-2 text-sm flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Maintenance en cours : certaines fonctionnalités peuvent être temporairement indisponibles.
      </span>
    </div>
  );
};

export default MaintenanceBanner;
