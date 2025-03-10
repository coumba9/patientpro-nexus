
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface UserLocationMarkerProps {
  map: L.Map | null;
  userLocation: [number, number] | null;
  selectedRadius: number;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ 
  map, 
  userLocation, 
  selectedRadius 
}) => {
  const userMarker = useRef<L.Marker | null>(null);
  const radiusCircle = useRef<L.Circle | null>(null);

  // Dessiner un cercle de rayon autour d'un point
  const drawRadiusCircle = (center: [number, number]) => {
    if (!map) return;
    
    // Supprimer l'ancien cercle s'il existe
    if (radiusCircle.current) {
      radiusCircle.current.removeFrom(map);
    }
    
    // Convertir le rayon km en mètres
    const radiusInMeters = selectedRadius * 1000;
    
    // Créer un cercle géographique
    radiusCircle.current = L.circle(center, {
      radius: radiusInMeters,
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.15,
      weight: 2
    }).addTo(map);
  };

  useEffect(() => {
    if (!map || !userLocation) return;

    // Créer ou mettre à jour le marqueur de l'utilisateur
    if (userMarker.current) {
      userMarker.current.setLatLng([userLocation[1], userLocation[0]]);
    } else {
      userMarker.current = L.marker([userLocation[1], userLocation[0]], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: iconShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      }).addTo(map);
    }
      
    // Dessiner le cercle de rayon autour de l'utilisateur
    drawRadiusCircle([userLocation[1], userLocation[0]]);

    return () => {
      if (map) {
        if (userMarker.current) {
          userMarker.current.removeFrom(map);
        }
        if (radiusCircle.current) {
          radiusCircle.current.removeFrom(map);
        }
      }
    };
  }, [map, userLocation, selectedRadius]);

  // Mettre à jour le cercle lorsque le rayon change
  useEffect(() => {
    if (!map || !userLocation) return;
    drawRadiusCircle([userLocation[1], userLocation[0]]);
  }, [selectedRadius, map, userLocation]);

  return null; // Ce composant ne rend rien, il gère juste le marqueur utilisateur et le cercle
};

export default UserLocationMarker;
