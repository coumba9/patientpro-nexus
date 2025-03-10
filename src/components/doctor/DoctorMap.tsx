
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import DoctorMarker from './map/DoctorMarker';
import UserLocationMarker from './map/UserLocationMarker';
import MapControls from './map/MapControls';

// Définir les icônes par défaut pour Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

interface DoctorMapProps {
  doctors: Doctor[];
  onDoctorSelect: (doctorId: number) => void;
  selectedRadius: number;
  userLocation: [number, number] | null;
}

const DoctorMap: React.FC<DoctorMapProps> = ({ 
  doctors, 
  onDoctorSelect, 
  selectedRadius,
  userLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

  // Configuration du style de la carte en fonction de la vue sélectionnée
  const getMapStyle = () => {
    return mapView === 'standard' 
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  };

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          if (map.current) {
            map.current.setView([userLat, userLng], 12);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  // Basculer entre les vues standard et satellite
  const toggleMapView = () => {
    const newView = mapView === 'standard' ? 'satellite' : 'standard';
    setMapView(newView);
    if (map.current) {
      const tileLayer = L.tileLayer(getMapStyle(), {
        attribution: newView === 'standard' 
          ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          : '&copy; <a href="https://www.arcgis.com/">ArcGIS</a> contributors'
      });
      
      // Supprimer les couches existantes et ajouter la nouvelle
      map.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.current?.removeLayer(layer);
        }
      });
      
      tileLayer.addTo(map.current);
    }
  };
  
  // Initialiser et configurer la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Centre initial de la carte (France)
    const initialCenter: [number, number] = [46.227638, 2.213749];
    
    map.current = L.map(mapContainer.current).setView(initialCenter, 5);

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer(getMapStyle(), {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Ajouter les contrôles de zoom
    L.control.zoom({ position: 'topright' }).addTo(map.current);
    
    // Si l'utilisateur a déjà partagé sa position
    if (userLocation) {
      map.current.setView([userLocation[1], userLocation[0]], 12);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Ajuster la vue aux marqueurs des médecins si nécessaire
  useEffect(() => {
    if (!map.current) return;
    
    // Créer un groupe pour tous les médecins avec des coordonnées valides
    const markers = doctors
      .filter(doctor => doctor.latitude && doctor.longitude)
      .map(doctor => {
        return L.marker([doctor.latitude!, doctor.longitude!]);
      });
    
    // Ajuster la vue si nécessaire
    if (markers.length > 0 && !userLocation) {
      const group = new L.FeatureGroup(markers);
      map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [doctors, userLocation]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {map.current && (
        <>
          {/* Composant de contrôles de carte */}
          <MapControls 
            onGetUserLocation={getUserLocation} 
            onToggleMapView={toggleMapView}
            mapView={mapView}
            doctorCount={doctors.length}
          />

          {/* Marqueur de localisation de l'utilisateur et cercle de rayon */}
          <UserLocationMarker 
            map={map.current} 
            userLocation={userLocation} 
            selectedRadius={selectedRadius} 
          />
          
          {/* Marqueurs des médecins */}
          {doctors.map(doctor => (
            doctor.latitude && doctor.longitude && (
              <DoctorMarker 
                key={doctor.id}
                doctor={doctor}
                map={map.current!}
                onDoctorSelect={onDoctorSelect}
              />
            )
          ))}
        </>
      )}
    </div>
  );
};

export default DoctorMap;
