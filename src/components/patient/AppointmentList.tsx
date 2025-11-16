import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentFilters } from "./AppointmentFilters";
import { Appointment } from "./types";

interface AppointmentListProps {
  appointments: Appointment[];
  onSendMessage: (doctorName: string, message: string) => void;
  onReschedule: (appointmentId: string, newDate: string, newTime: string, reason?: string) => void;
  onConfirm: (appointmentId: string) => void;
}

export const AppointmentList = ({
  appointments,
  onSendMessage,
  onReschedule,
  onConfirm,
}: AppointmentListProps) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const now = new Date();
  
  // Calculer les compteurs pour chaque filtre
  const counts = {
    all: appointments.length,
    upcoming: appointments.filter(apt => {
      const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
      return appointmentDateTime >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
    }).length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    pending: appointments.filter(apt => 
      apt.status === 'pending' || apt.status === 'awaiting_patient_confirmation'
    ).length,
  };

  // Filtrer les rendez-vous selon le filtre actif
  const getFilteredAppointments = () => {
    switch (activeFilter) {
      case 'upcoming':
        return appointments.filter(apt => {
          const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
          return appointmentDateTime >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
        });
      case 'completed':
        return appointments.filter(apt => apt.status === 'completed');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
      case 'pending':
        return appointments.filter(apt => 
          apt.status === 'pending' || apt.status === 'awaiting_patient_confirmation'
        );
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();
  
  // Trier par date (les plus récents en premier)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'upcoming':
        return 'Rendez-vous à venir';
      case 'completed':
        return 'Rendez-vous terminés';
      case 'cancelled':
        return 'Rendez-vous annulés';
      case 'pending':
        return 'Rendez-vous en attente';
      default:
        return 'Tous les rendez-vous';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <AppointmentFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* Liste des rendez-vous */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{getFilterTitle()}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {sortedAppointments.length} rendez-vous
            </p>
          </div>
          <Link to="/find-doctor">
            <Button>Prendre un rendez-vous</Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onSendMessage={onSendMessage}
                onReschedule={onReschedule}
                onConfirm={onConfirm}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {activeFilter === 'upcoming' && "Aucun rendez-vous à venir"}
                {activeFilter === 'completed' && "Aucun rendez-vous terminé"}
                {activeFilter === 'cancelled' && "Aucun rendez-vous annulé"}
                {activeFilter === 'pending' && "Aucun rendez-vous en attente"}
                {activeFilter === 'all' && "Aucun rendez-vous"}
              </div>
              {activeFilter === 'upcoming' && (
                <Link to="/find-doctor">
                  <Button>Prendre un rendez-vous</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
