
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Locate, Layers, Map as MapIcon } from 'lucide-react';

// Définir le token d'accès Mapbox - Remplacez par votre propre token
// En production, utilisez les variables d'environnement pour cela
// Note: Normalement ce token devrait être stocké dans un .env file
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImNsMno4eTBjdTAwMGMzY3BmcXNlbGExdWUifQ.exampletoken123456';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(MAPBOX_ACCESS_TOKEN);
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

  // Configuration du style de la carte en fonction de la vue sélectionnée
  const getMapStyle = () => {
    return mapView === 'standard' 
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-streets-v12';
  };

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 12
            });
            
            // Ajouter un marqueur pour la position de l'utilisateur
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat([position.coords.longitude, position.coords.latitude])
              .addTo(map.current);
              
            // Dessiner le cercle de rayon autour de l'utilisateur
            drawRadiusCircle([position.coords.longitude, position.coords.latitude]);
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
    if (map.current.getSource('radius-circle')) {
      map.current.removeLayer('radius-fill');
      map.current.removeLayer('radius-outline');
      map.current.removeSource('radius-circle');
    }
    
    // Convertir le rayon km en mètres
    const radiusInMeters = selectedRadius * 1000;
    
    // Créer un cercle géographique
    const circleOptions: mapboxgl.AnySourceData = {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center
        },
        properties: {
          radius: radiusInMeters
        }
      }
    };
    
    map.current.addSource('radius-circle', circleOptions);
    
    // Ajouter une couche de remplissage pour le cercle
    map.current.addLayer({
      id: 'radius-fill',
      type: 'circle',
      source: 'radius-circle',
      paint: {
        'circle-radius': ['get', 'radius'],
        'circle-color': '#3B82F6',
        'circle-opacity': 0.15,
        'circle-radius-transition': { duration: 500 }
      }
    });
    
    // Ajouter une couche de contour pour le cercle
    map.current.addLayer({
      id: 'radius-outline',
      type: 'circle',
      source: 'radius-circle',
      paint: {
        'circle-radius': ['get', 'radius'],
        'circle-color': '#3B82F6',
        'circle-opacity': 0,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#3B82F6',
        'circle-radius-transition': { duration: 500 }
      }
    });
  };

  // Basculer entre les vues standard et satellite
  const toggleMapView = () => {
    const newView = mapView === 'standard' ? 'satellite' : 'standard';
    setMapView(newView);
    if (map.current) {
      map.current.setStyle(newView === 'standard' 
        ? 'mapbox://styles/mapbox/streets-v12' 
        : 'mapbox://styles/mapbox/satellite-streets-v12'
      );
    }
  };
  
  // Initialiser et configurer la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    // Centre initial de la carte (France)
    const initialCenter: [number, number] = [2.213749, 46.227638];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
      center: initialCenter,
      zoom: 5
    });

    // Ajouter les contrôles de navigation
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Détecter quand la carte est chargée
    map.current.on('load', () => {
      // Si l'utilisateur a déjà partagé sa position
      if (userLocation) {
        map.current?.flyTo({
          center: userLocation,
          zoom: 12
        });
        
        new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat(userLocation)
          .addTo(map.current!);
          
        drawRadiusCircle(userLocation);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Mettre à jour les marqueurs des médecins quand la liste change
  useEffect(() => {
    if (!map.current) return;
    
    // Supprimer les anciens marqueurs
    const markers = document.getElementsByClassName('doctor-marker');
    while (markers[0]) {
      markers[0].remove();
    }
    
    // Ajouter de nouveaux marqueurs pour chaque médecin
    doctors.forEach(doctor => {
      // Coordonnées fictives basées sur la localisation
      // En production, utilisez de vraies coordonnées géographiques
      const getCoordinatesFromLocation = (location: string): [number, number] => {
        // Simulation de coordonnées pour les villes françaises
        switch (location.toLowerCase()) {
          case 'paris': return [2.3522, 48.8566];
          case 'lyon': return [4.8357, 45.7640];
          case 'marseille': return [5.3698, 43.2965];
          case 'toulouse': return [1.4437, 43.6047];
          case 'nice': return [7.2620, 43.7102];
          case 'nantes': return [-1.5534, 47.2184];
          case 'strasbourg': return [7.7521, 48.5734];
          case 'montpellier': return [3.8767, 43.6108];
          case 'bordeaux': return [-0.5792, 44.8378];
          case 'lille': return [3.0573, 50.6292];
          default: 
            // Coordonnées aléatoires autour de la France pour les autres lieux
            const baseCoords = [2.213749, 46.227638]; // Centre de la France
            return [
              baseCoords[0] + (Math.random() * 4) - 2,
              baseCoords[1] + (Math.random() * 4) - 2
            ];
        }
      };

      // Utiliser les coordonnées du médecin si elles existent, sinon les générer
      const coordinates: [number, number] = doctor.latitude && doctor.longitude 
        ? [doctor.longitude, doctor.latitude] 
        : getCoordinatesFromLocation(doctor.location);
        
      // Créer un élément HTML pour le marqueur
      const el = document.createElement('div');
      el.className = 'doctor-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3B82F6';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.color = 'white';
      el.style.fontSize = '14px';
      el.style.fontWeight = 'bold';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.innerHTML = doctor.name.substring(0, 1);
      
      // Créer une popup avec les informations du médecin
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px; font-weight: 600;">${doctor.name}</h3>
            <p style="margin: 0 0 5px;">${doctor.specialty}</p>
            <p style="margin: 0 0 5px;"><span style="color: gold;">★</span> ${doctor.rating}</p>
            <p style="margin: 0 0 5px; color: green;">${doctor.availability}</p>
            <button id="select-doctor-${doctor.id}" style="background-color: #3B82F6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
              Voir profil
            </button>
          </div>
        `);
      
      // Ajouter le marqueur à la carte
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);
      
      // Ajouter un écouteur d'événement pour la sélection du médecin
      marker.getElement().addEventListener('click', () => {
        popup.addTo(map.current!);
        // L'écouteur pour le bouton sera ajouté une fois que la popup est dans le DOM
        setTimeout(() => {
          const button = document.getElementById(`select-doctor-${doctor.id}`);
          if (button) {
            button.addEventListener('click', () => {
              onDoctorSelect(doctor.id);
            });
          }
        }, 100);
      });
    });
  }, [doctors, onDoctorSelect]);

  // Mettre à jour le cercle de rayon quand le rayon sélectionné change
  useEffect(() => {
    if (!map.current || !userLocation) return;
    drawRadiusCircle(userLocation);
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
