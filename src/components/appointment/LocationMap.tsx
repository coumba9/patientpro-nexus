import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationMapProps {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  doctorName: string;
}

export const LocationMap = ({
  address,
  latitude,
  longitude,
  doctorName,
}: LocationMapProps) => {
  const hasLocation = latitude && longitude;
  
  const handleOpenMap = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(url, "_blank");
    }
  };

  if (!hasLocation && !address) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Localisation du cabinet</h3>
            {address && (
              <p className="text-sm text-muted-foreground mb-3">
                {address}
              </p>
            )}
            
            {hasLocation && (
              <div className="space-y-2">
                <div className="aspect-video w-full rounded-lg overflow-hidden border">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Localisation de ${doctorName}`}
                  />
                </div>
                
                <Button
                  onClick={handleOpenMap}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Navigation className="h-4 w-4" />
                  Obtenir l'itinéraire
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
