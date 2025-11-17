import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const LocationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    loadLocation();
  }, [user]);

  const loadLocation = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("address, latitude, longitude")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setLocation({
          address: data.address || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la localisation:", error);
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            ...location,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
          toast.success("Position GPS récupérée");
        },
        (error) => {
          console.error("Erreur géolocalisation:", error);
          toast.error("Impossible de récupérer votre position");
        }
      );
    } else {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("doctors")
        .update({
          address: location.address || null,
          latitude: location.latitude ? parseFloat(location.latitude) : null,
          longitude: location.longitude ? parseFloat(location.longitude) : null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Localisation mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la mise à jour de la localisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation du cabinet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Adresse complète</Label>
          <Input
            id="address"
            value={location.address}
            onChange={(e) =>
              setLocation({ ...location, address: e.target.value })
            }
            placeholder="Ex: 123 Avenue de la République, Dakar"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={location.latitude}
              onChange={(e) =>
                setLocation({ ...location, latitude: e.target.value })
              }
              placeholder="14.693425"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={location.longitude}
              onChange={(e) =>
                setLocation({ ...location, longitude: e.target.value })
              }
              placeholder="-17.447938"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Obtenir ma position
          </Button>
        </div>

        {location.latitude && location.longitude && (
          <div className="text-xs text-muted-foreground">
            <a
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Voir sur Google Maps
            </a>
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Enregistrement..." : "Enregistrer la localisation"}
        </Button>
      </CardContent>
    </Card>
  );
};
