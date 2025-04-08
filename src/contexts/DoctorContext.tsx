
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

// Mock doctors data
const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Fatou Sarr",
    specialty: "Cardiologue",
    location: "Dakar",
    availability: "Disponible aujourd'hui",
    rating: 4.8,
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    id: 2,
    name: "Dr. Amadou Sarre",
    specialty: "Dermatologue",
    location: "Saint-Louis",
    availability: "Disponible demain",
    rating: 4.9,
    latitude: 45.7640,
    longitude: 4.8357
  },
  {
    id: 3,
    name: "Dr. Khadija Deme",
    specialty: "Pédiatre",
    location: "Thies",
    availability: "Disponible cette semaine",
    rating: 4.7,
    latitude: 43.2965,
    longitude: 5.3698
  },
  {
    id: 4,
    name: "Dr. Ahmadou Fall",
    specialty: "Généraliste",
    location: "Podor",
    availability: "Disponible aujourd'hui",
    rating: 4.5,
    latitude: 43.6047,
    longitude: 1.4437
  },
  {
    id: 5,
    name: "Dr. Aissatou Ndiaye",
    specialty: "Ophtalmologue",
    location: "Matam",
    availability: "Disponible cette semaine",
    rating: 4.6,
    latitude: 43.7102,
    longitude: 7.2620
  },
  {
    id: 6,
    name: "Dr. Kalidou Diop",
    specialty: "Psychiatre",
    location: "Keur Massar",
    availability: "Disponible demain",
    rating: 4.9,
    latitude: 44.8378,
    longitude: -0.5792
  },
];

interface DoctorContextType {
  doctors: Doctor[];
  filteredDoctors: Doctor[];
  searchTerm: string;
  location: string;
  selectedRadius: number;
  userLocation: [number, number] | null;
  setSearchTerm: (term: string) => void;
  setLocation: (location: string) => void;
  setSelectedRadius: (radius: number) => void;
  handleSearch: () => void;
  getUserLocation: () => void;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockDoctors);
  const [selectedRadius, setSelectedRadius] = useState(15);
  const { userLocation, getUserLocation, filterDoctorsByProximity } = useUserLocation();

  // Apply all filters (search, location, proximity)
  const applyAllFilters = (doctors = mockDoctors) => {
    const filtered = doctors.filter(
      (doctor) =>
        (searchTerm === "" ||
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (location === "" ||
          doctor.location.toLowerCase().includes(location.toLowerCase()))
    );

    setFilteredDoctors(filtered);
  };

  // Handle search action
  const handleSearch = () => {
    if (userLocation) {
      const doctorsInRadius = filterDoctorsByProximity(mockDoctors, selectedRadius);
      applyAllFilters(doctorsInRadius);
    } else {
      applyAllFilters();
    }
  };

  // Update filtered doctors when radius changes
  const handleRadiusChange = (newRadius: number) => {
    setSelectedRadius(newRadius);
    if (userLocation) {
      const doctorsInRadius = filterDoctorsByProximity(mockDoctors, newRadius);
      applyAllFilters(doctorsInRadius);
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctors: mockDoctors,
        filteredDoctors,
        searchTerm,
        location,
        selectedRadius,
        userLocation,
        setSearchTerm,
        setLocation,
        setSelectedRadius: handleRadiusChange,
        handleSearch,
        getUserLocation
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (context === undefined) {
    throw new Error('useDoctorContext must be used within a DoctorProvider');
  }
  return context;
};
