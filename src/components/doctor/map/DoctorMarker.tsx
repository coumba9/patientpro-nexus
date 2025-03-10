
import React from 'react';
import L from 'leaflet';

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

interface DoctorMarkerProps {
  doctor: Doctor;
  map: L.Map;
  onDoctorSelect: (doctorId: number) => void;
}

const DoctorMarker: React.FC<DoctorMarkerProps> = ({ doctor, map, onDoctorSelect }) => {
  React.useEffect(() => {
    if (!map) return;

    // Créer une icône de médecin personnalisée
    const doctorIcon = L.divIcon({
      className: 'doctor-marker',
      html: `<div style="width: 30px; height: 30px; border-radius: 50%; background-color: #3B82F6; display: flex; justify-content: center; align-items: center; color: white; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${doctor.name.substring(0, 1)}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

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

    // Coordonnées du médecin
    const coordinates: [number, number] = doctor.latitude && doctor.longitude 
      ? [doctor.latitude, doctor.longitude] 
      : [0, 0]; // Fallback should never happen as coordinates are set in DoctorMap.tsx

    // Ajouter le marqueur à la carte
    const marker = L.marker(coordinates, {
      icon: doctorIcon
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
    
    marker.addTo(map);
    
    // Cleanup
    return () => {
      if (map) {
        marker.removeFrom(map);
      }
    };
  }, [doctor, map, onDoctorSelect]);

  return null; // Ce composant ne rend rien, il gère juste les marqueurs
};

export default DoctorMarker;
