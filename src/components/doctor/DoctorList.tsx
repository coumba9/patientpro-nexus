import React from 'react';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import DoctorCard from './DoctorCard';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
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
      {doctors.map((doctor, index) => (
        <motion.div
          key={doctor.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <DoctorCard 
            doctor={doctor} 
            onBooking={onBooking} 
          />
        </motion.div>
      ))}
    </div>
  );
};

export default DoctorList;
