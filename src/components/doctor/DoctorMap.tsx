
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Locate, Layers, Map as MapIcon } from 'lucide-react';

// Correction pour les icônes de Leaflet qui ne chargent pas correctement avec Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
  const radiusCircle = useRef<L.Circle | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const doctorMarkers = useRef<L.Marker[]>([]);
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

  // Configuration du style de la carte en fonction de la vue sélectionnée
  const getMapStyle = () => {
    return mapView === 'standard' 
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  };

  // Fonction pour créer une icône de médecin personnalisée
  const createDoctorIcon = (name: string) => {
    const divIcon = L.divIcon({
      className: 'doctor-marker',
      html: `<div style="width: 30px; height: 30px; border-radius: 50%; background-color: #3B82F6; display: flex; justify-content: center; align-items: center; color: white; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${name.substring(0, 1)}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
    return divIcon;
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
            
            // Ajouter un marqueur pour la position de l'utilisateur
            if (userMarker.current) {
              userMarker.current.setLatLng([userLat, userLng]);
            } else {
              userMarker.current = L.marker([userLat, userLng], {
                icon: L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                  shadowUrl: iconShadow,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })
              }).addTo(map.current);
            }
              
            // Dessiner le cercle de rayon autour de l'utilisateur
            drawRadiusCircle([userLat, userLng]);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  // Dessiner un cercle de rayon autour d'un point
  const drawRadiusCircle = (center: [number, number]) => {
    if (!map.current) return;
    
    // Supprimer l'ancien cercle s'il existe
    if (radiusCircle.current) {
      radiusCircle.current.removeFrom(map.current);
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
    }).addTo(map.current);
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
      
      userMarker.current = L.marker([userLocation[1], userLocation[0]], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: iconShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      }).addTo(map.current);
        
      drawRadiusCircle([userLocation[1], userLocation[0]]);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs des médecins quand la liste change
  useEffect(() => {
    if (!map.current) return;
    
    // Supprimer les anciens marqueurs
    doctorMarkers.current.forEach(marker => {
      marker.removeFrom(map.current!);
    });
    doctorMarkers.current = [];
    
    // Ajouter de nouveaux marqueurs pour chaque médecin
    doctors.forEach(doctor => {
      // Coordonnées fictives basées sur la localisation
      // En production, utilisez de vraies coordonnées géographiques
      const getCoordinatesFromLocation = (location: string): [number, number] => {
        // Simulation de coordonnées pour les villes françaises
        switch (location.toLowerCase()) {
          case 'paris': return [48.8566, 2.3522];
          case 'lyon': return [45.7640, 4.8357];
          case 'marseille': return [43.2965, 5.3698];
          case 'toulouse': return [43.6047, 1.4437];
          case 'nice': return [43.7102, 7.2620];
          case 'nantes': return [47.2184, -1.5534];
          case 'strasbourg': return [48.5734, 7.7521];
          case 'montpellier': return [43.6108, 3.8767];
          case 'bordeaux': return [44.8378, -0.5792];
          case 'lille': return [50.6292, 3.0573];
          default: 
            // Coordonnées aléatoires autour de la France pour les autres lieux
            const baseCoords = [46.227638, 2.213749]; // Centre de la France
            return [
              baseCoords[0] + (Math.random() * 4) - 2,
              baseCoords[1] + (Math.random() * 4) - 2
            ];
        }
      };

      // Utiliser les coordonnées du médecin si elles existent, sinon les générer
      const coordinates: [number, number] = doctor.latitude && doctor.longitude 
        ? [doctor.latitude, doctor.longitude] 
        : getCoordinatesFromLocation(doctor.location);
        
      // Créer un popup avec les informations du médecin
      const popupContent = `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px; font-weight: 600;">${doctor.name}</h3>
          <p style="margin: 0 0 5px;">${doctor.specialty}</p>
          <p style="margin: 0 0 5px;"><span style="color: gold;">★</span> ${doctor.rating}</p>
          <p style="margin: 0 0 5px; color: green;">${doctor.availability}</p>
          <button id="select-doctor-${doctor.id}" style="background-color: #3B82F6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Voir profil
          </button>
        </div>
      `;
      
      // Ajouter le marqueur à la carte
      const marker = L.marker(coordinates, {
        icon: createDoctorIcon(doctor.name)
      }).bindPopup(popupContent);
      
      marker.on('click', () => {
        setTimeout(() => {
          const button = document.getElementById(`select-doctor-${doctor.id}`);
          if (button) {
            button.addEventListener('click', () => {
              onDoctorSelect(doctor.id);
            });
          }
        }, 100);
      });
      
      marker.addTo(map.current!);
      doctorMarkers.current.push(marker);
    });
    
    // Créer un groupe de tous les marqueurs et ajuster la vue si nécessaire
    if (doctorMarkers.current.length > 0 && !userLocation) {
      const group = new L.FeatureGroup(doctorMarkers.current);
      map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [doctors, onDoctorSelect]);

  // Mettre à jour le cercle de rayon quand le rayon sélectionné change
  useEffect(() => {
    if (!map.current || !userLocation) return;
    drawRadiusCircle([userLocation[1], userLocation[0]]);
  }, [selectedRadius, userLocation]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button 
          onClick={getUserLocation}
          size="sm"
          className="flex items-center gap-2 bg-white text-primary hover:bg-gray-100"
          variant="outline"
        >
          <Locate className="w-4 h-4" />
          Ma position
        </Button>
        
        <Button 
          onClick={toggleMapView}
          size="sm"
          className="flex items-center gap-2 bg-white text-primary hover:bg-gray-100"
          variant="outline"
        >
          <Layers className="w-4 h-4" />
          {mapView === 'standard' ? 'Vue satellite' : 'Vue standard'}
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 bg-white px-3 py-2 rounded-md shadow-sm flex items-center gap-2">
        <MapIcon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {doctors.length} médecins trouvés
        </span>
      </div>
    </div>
  );
};

export default DoctorMap;
