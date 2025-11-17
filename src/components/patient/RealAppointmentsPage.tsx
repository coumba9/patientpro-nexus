import { useAuth } from "@/hooks/useAuth";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { AppointmentStats } from "./AppointmentStats";
import { AppointmentList } from "./AppointmentList";
import { AppointmentFilters } from "./AppointmentFilters";
import { AdvancedAppointmentFilters, AdvancedFilters } from "./AdvancedAppointmentFilters";
import { toast } from "sonner";
import { appointmentService } from "@/api/services/appointment.service";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";

export const RealAppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments, loading } = useRealtimeAppointments(user?.id || null, 'patient');
  const [activeFilter, setActiveFilter] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Charger les spécialités pour les filtres
    const loadSpecialties = async () => {
      const { data } = await supabase
        .from("specialties")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      
      if (data) {
        setSpecialties(data);
      }
    };
    
    loadSpecialties();
  }, []);

  const handleSendMessage = (doctorName: string, message: string) => {
    if (message.trim()) {
      toast.success(`Message envoyé au ${doctorName}`);
    }
  };

  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string, reason?: string) => {
    try {
      if (!user?.id) {
        toast.error("Vous devez être connecté");
        return;
      }

      await appointmentService.rescheduleAppointment(
        appointmentId,
        newDate,
        newTime,
        user.id,
        'patient',
        reason
      );
      
      toast.success("Demande de report envoyée au médecin");
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error("Erreur lors du report du rendez-vous");
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      if (!user?.id) {
        toast.error("Vous devez être connecté");
        return;
      }
      await appointmentService.patientConfirmAppointment(appointmentId, user.id);
      toast.success("Rendez-vous confirmé avec succès");
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error("Le médecin doit d'abord valider ce rendez-vous");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement de vos rendez-vous...</div>;
  }

  // Transform appointments to match the expected format
  const transformedAppointments = appointments.map(apt => ({
    id: apt.id,
    doctor: (apt as any).doctor?.profile ? 
      `Dr. ${(apt as any).doctor.profile.first_name} ${(apt as any).doctor.profile.last_name}` : 
      `Médecin ${apt.doctor_id.slice(0, 8)}...`,
    specialty: (apt as any).doctor?.specialty?.name || 
      (apt as any).doctor?.specialties?.name || 
      'Spécialité à définir',
    date: apt.date,
    time: apt.time,
    location: apt.location || 'À définir',
    type: apt.type,
    status: apt.status as "confirmed" | "pending" | "awaiting_patient_confirmation" | "completed" | "cancelled",
    doctorId: apt.doctor_id,
    mode: apt.mode,
  }));

  // Appliquer les filtres
  const filteredAppointments = useMemo(() => {
    let filtered = transformedAppointments;

    // Filtre par statut
    if (activeFilter !== "all") {
      if (activeFilter === "upcoming") {
        filtered = filtered.filter(apt => 
          ["confirmed", "awaiting_patient_confirmation"].includes(apt.status) &&
          new Date(apt.date) >= new Date()
        );
      } else if (activeFilter === "completed") {
        filtered = filtered.filter(apt => apt.status === "completed");
      } else if (activeFilter === "cancelled") {
        filtered = filtered.filter(apt => apt.status === "cancelled");
      } else if (activeFilter === "pending") {
        filtered = filtered.filter(apt => apt.status === "pending");
      }
    }

    // Filtres avancés
    if (advancedFilters.dateFrom) {
      filtered = filtered.filter(apt => apt.date >= advancedFilters.dateFrom!);
    }
    if (advancedFilters.dateTo) {
      filtered = filtered.filter(apt => apt.date <= advancedFilters.dateTo!);
    }
    if (advancedFilters.doctorName) {
      const searchTerm = advancedFilters.doctorName.toLowerCase();
      filtered = filtered.filter(apt => apt.doctor.toLowerCase().includes(searchTerm));
    }
    if (advancedFilters.specialty) {
      filtered = filtered.filter(apt => apt.specialty === advancedFilters.specialty);
    }
    if (advancedFilters.appointmentType) {
      filtered = filtered.filter(apt => apt.type === advancedFilters.appointmentType);
    }
    if (advancedFilters.consultationMode) {
      filtered = filtered.filter(apt => apt.mode === advancedFilters.consultationMode);
    }

    return filtered;
  }, [transformedAppointments, activeFilter, advancedFilters]);

  // Calculer les comptes pour chaque filtre
  const filterCounts = useMemo(() => {
    const now = new Date();
    return {
      all: transformedAppointments.length,
      upcoming: transformedAppointments.filter(apt => 
        ["confirmed", "awaiting_patient_confirmation"].includes(apt.status) &&
        new Date(apt.date) >= now
      ).length,
      completed: transformedAppointments.filter(apt => apt.status === "completed").length,
      cancelled: transformedAppointments.filter(apt => apt.status === "cancelled").length,
      pending: transformedAppointments.filter(apt => apt.status === "pending").length,
    };
  }, [transformedAppointments]);

  return (
    <div className="space-y-6">
      <AppointmentStats appointmentsCount={appointments.length} />
      
      <div className="flex flex-wrap gap-2 items-center">
        <AppointmentFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
        <AdvancedAppointmentFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          specialties={specialties}
        />
      </div>

      <AppointmentList
        appointments={filteredAppointments}
        onSendMessage={handleSendMessage}
        onReschedule={handleReschedule}
        onConfirm={handleConfirm}
      />
    </div>
  );
};