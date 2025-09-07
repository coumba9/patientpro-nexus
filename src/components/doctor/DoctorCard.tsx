
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

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

interface DoctorCardProps {
  doctor: Doctor;
  onBooking: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBooking }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
      <p className="text-gray-600 mb-1">{doctor.specialty}</p>
      <p className="text-gray-600 mb-1">
        <MapPin className="w-4 h-4 inline mr-1" />
        {doctor.location}
      </p>
      <p className="text-green-600 mb-4">{doctor.availability}</p>
      <div className="flex justify-between items-center">
        <div className="text-yellow-500">★ {doctor.rating}</div>
        <Button onClick={() => onBooking(doctor)}>Prendre RDV</Button>
      </div>
    </div>
  );
};

export default DoctorCard;
