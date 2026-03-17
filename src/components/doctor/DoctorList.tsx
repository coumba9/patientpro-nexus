import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchX, Heart, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DoctorCard from './DoctorCard';
import { useFavoriteDoctors } from '@/hooks/useFavoriteDoctors';
import { useAuth } from '@/hooks/useAuth';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
  rating_count?: number;
  latitude?: number;
  longitude?: number;
  years_of_experience?: number;
  is_verified?: boolean;
}

interface DoctorListProps {
  doctors: Doctor[];
  onBooking: (doctor: Doctor) => void;
}

const DoctorList: React.FC<DoctorListProps> = ({ doctors, onBooking }) => {
  const { user, userRole } = useAuth();
  const { isFavorite, toggleFavorite } = useFavoriteDoctors();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const isPatient = user && userRole === 'patient';

  const displayedDoctors = showFavoritesOnly
    ? doctors.filter(d => isFavorite(d.id))
    : doctors;

  if (doctors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <SearchX className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun médecin trouvé
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Essayez de modifier vos critères de recherche ou d'élargir votre zone géographique pour trouver plus de praticiens.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {isPatient && (
        <div className="flex items-center gap-2">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Mes favoris
          </Button>
          {showFavoritesOnly && displayedDoctors.length === 0 && (
            <span className="text-sm text-muted-foreground">Aucun médecin favori trouvé</span>
          )}
        </div>
      )}
      {displayedDoctors.map((doctor, index) => (
        <motion.div
          key={doctor.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <DoctorCard 
            doctor={doctor} 
            onBooking={onBooking}
            isFavorite={isFavorite(doctor.id)}
            onToggleFavorite={isPatient ? toggleFavorite : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default DoctorList;
