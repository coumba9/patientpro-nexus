import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Star, 
  Clock, 
  Video, 
  Calendar, 
  Shield,
  ChevronRight,
  User
} from "lucide-react";
import { motion } from "framer-motion";

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
  nextAvailableSlots?: string[];
}

interface DoctorCardProps {
  doctor: Doctor;
  onBooking: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBooking }) => {
  // Mock next available slots - in real app, this would come from the doctor's schedule
  const nextSlots = doctor.nextAvailableSlots || ['10:00', '10:30', '11:00', '14:00', '15:30'];
  
  const getAvailabilityColor = (availability: string) => {
    if (availability.toLowerCase().includes("aujourd'hui")) {
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    }
    if (availability.toLowerCase().includes('demain')) {
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    }
    return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20 group"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Doctor Avatar & Basic Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            {doctor.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-semibold text-foreground truncate">{doctor.name}</h3>
              {doctor.is_verified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Vérifié
                </Badge>
              )}
            </div>
            
            <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>
              
              {doctor.years_of_experience && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.years_of_experience} ans d'exp.</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">{doctor.rating}</span>
                <span className="text-muted-foreground">/5</span>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(doctor.availability)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {doctor.availability}
              </span>
            </div>
          </div>
        </div>

        {/* Available Slots & Booking */}
        <div className="md:w-72 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Prochains créneaux disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {nextSlots.slice(0, 5).map((slot, index) => (
                <button
                  key={index}
                  onClick={() => onBooking(doctor)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                >
                  {slot}
                </button>
              ))}
              {nextSlots.length > 5 && (
                <span className="px-3 py-1.5 text-sm text-muted-foreground">
                  +{nextSlots.length - 5}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onBooking(doctor)} 
              className="flex-1 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity group-hover:shadow-md"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Prendre RDV
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              title="Téléconsultation disponible"
            >
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
