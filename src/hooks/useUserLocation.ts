
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface UserLocationHook {
  userLocation: [number, number] | null;
  getUserLocation: () => void;
  filterDoctorsByProximity: <T extends { latitude?: number; longitude?: number }>(
    doctors: T[],
    radiusKm: number
  ) => T[];
}

export const useUserLocation = (): UserLocationHook => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Request user's geolocation on hook initialization
  useEffect(() => {
    getUserLocation();
  }, []);

  // Get the user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          toast.success("Votre position a été détectée");
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          toast.error("Impossible de récupérer votre position");
        }
      );
    }
  };

  // Helper function to calculate distance between two coordinates
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Filter doctors by proximity to user location
  const filterDoctorsByProximity = <T extends { latitude?: number; longitude?: number }>(
    doctors: T[],
    radiusKm: number
  ): T[] => {
    if (!userLocation) return doctors;

    return doctors.filter(doctor => {
      if (!doctor.latitude || !doctor.longitude) return true;

      const distance = getDistanceFromLatLonInKm(
        userLocation[1],
        userLocation[0],
        doctor.latitude,
        doctor.longitude
      );

      return distance <= radiusKm;
    });
  };

  return {
    userLocation,
    getUserLocation,
    filterDoctorsByProximity
  };
};
