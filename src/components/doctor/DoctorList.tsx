
import React from 'react';
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
}

interface DoctorListProps {
  doctors: Doctor[];
  onBooking: (doctor: Doctor) => void;
}

const DoctorList: React.FC<DoctorListProps> = ({ doctors, onBooking }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <DoctorCard 
          key={doctor.id} 
          doctor={doctor} 
          onBooking={onBooking} 
        />
      ))}
    </div>
  );
};

export default DoctorList;
