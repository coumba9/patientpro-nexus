
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { doctorService } from "@/api/services/doctor.service";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getSearchAvailability, SearchSlot, slotLabel } from '@/api/services/searchAvailability.service';
import { matchesSearch } from "@/lib/searchUtils";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialty_id?: string;
  location: string;
  availability: string;
  rating: number;
  rating_count?: number;
  latitude?: number;
  longitude?: number;
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  specialty_name?: string;
  years_of_experience?: number;
  is_verified?: boolean;
  average_rating?: number;
  slots?: SearchSlot[];
  nextAvailableSlots?: string[];
  teleconsultation?: boolean;
}

interface DoctorContextType {
  loading: boolean;
  error: string | null;
  refresh: () => void;
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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(15);
  const { user } = useAuth();
  const { userLocation, getUserLocation, filterDoctorsByProximity } = useUserLocation();
  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['doctor-search', user?.id],
    refetchInterval: 60000,
    staleTime: 30000,
    queryFn: async () => {
      const realDoctors = await doctorService.getDoctorsWithDetails();
      const ids = realDoctors.map(d => d.id);
      const [slots, locationsResult] = await Promise.all([
        user ? getSearchAvailability(ids) : Promise.resolve([]),
        user ? supabase.from('practice_locations').select('doctor_id,address,city,latitude,longitude,is_primary').eq('is_active', true) : Promise.resolve({ data: [], error: null }),
      ]);
      if (locationsResult.error) throw locationsResult.error;
      return realDoctors.map((doctor): Doctor => {
        const places = (locationsResult.data || []).filter(l => l.doctor_id === doctor.id);
        const place = places.find(l => l.is_primary) || places[0];
        const available = slots.filter(s => s.doctor_id === doctor.id);
        return {
          id: doctor.id,
          name: `Dr. ${doctor.profile?.first_name || ''} ${doctor.profile?.last_name || ''}`.trim(),
          specialty: doctor.specialty?.name || 'Spécialité non renseignée',
          specialty_id: doctor.specialty_id,
          location: places.map(l => [l.address, l.city].filter(Boolean).join(', ')).join(' · ') || 'Adresse non renseignée',
          latitude: place?.latitude ?? undefined,
          longitude: place?.longitude ?? undefined,
          availability: !user ? 'Connectez-vous pour voir les disponibilités' : available.length ? `Prochain créneau : ${slotLabel(available[0])}` : 'Aucun créneau dans les 30 prochains jours',
          slots: available,
          nextAvailableSlots: [...new Set(available.map(slotLabel))],
          teleconsultation: available.some(s => s.teleconsultation),
          rating: doctor.average_rating || 0,
          rating_count: doctor.rating_count || 0,
          years_of_experience: doctor.years_of_experience,
          is_verified: doctor.is_verified,
        };
      });
    },
  });
  const error = queryError ? 'Impossible de charger les disponibilités. Veuillez réessayer.' : null;
  useEffect(() => { setDoctors(data || []); }, [data]);

  // Recherche automatique (au fil de la frappe) avec un léger debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const base = userLocation
        ? filterDoctorsByProximity(doctors, selectedRadius)
        : doctors;

      const filtered = base.filter(
        (doctor) =>
          matchesSearch(searchTerm, doctor.name, doctor.specialty, doctor.specialty_name) &&
          matchesSearch(location, doctor.location)
      );

      setFilteredDoctors(filtered);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, location, doctors, userLocation, selectedRadius]);

  // Le bouton "Rechercher" ne fait que forcer la géolocalisation déjà appliquée
  const handleSearch = () => {
    const base = userLocation
      ? filterDoctorsByProximity(doctors, selectedRadius)
      : doctors;

    setFilteredDoctors(
      base.filter(
        (doctor) =>
          matchesSearch(searchTerm, doctor.name, doctor.specialty, doctor.specialty_name) &&
          matchesSearch(location, doctor.location)
      )
    );
  };

  const handleRadiusChange = (newRadius: number) => {
    setSelectedRadius(newRadius);
  };

  return (
    <DoctorContext.Provider
      value={{
        loading,
        error,
        refresh: () => { void refetch(); },
        doctors,
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
