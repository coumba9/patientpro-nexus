import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/api/interfaces';

export const useRealtimeAppointments = (userId: string | null, userRole: 'doctor' | 'patient' | null) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userRole) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchAppointments = async () => {
      try {
        // Récupérer les appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq(userRole === 'doctor' ? 'doctor_id' : 'patient_id', userId)
          .order('date', { ascending: true });

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          return;
        }

        if (!appointmentsData || appointmentsData.length === 0) {
          setAppointments([]);
          return;
        }

        // Pour chaque appointment, récupérer les infos des médecins et patients
        const enrichedAppointments = await Promise.all(
          appointmentsData.map(async (appointment) => {
            let enrichedAppointment = { ...appointment };

            // Récupérer les infos du médecin
            const { data: doctorData } = await supabase
              .from('doctors')
              .select(`
                id,
                license_number,
                years_of_experience,
                specialty_id,
                specialties!inner(name, description)
              `)
              .eq('id', appointment.doctor_id)
              .single();

            // Récupérer le profil du médecin
            const { data: doctorProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', appointment.doctor_id)
              .single();

            if (doctorData && doctorProfile) {
              (enrichedAppointment as any).doctor = {
                ...doctorData,
                profile: doctorProfile,
                specialty: doctorData.specialties
              };
            }

            // Récupérer les infos du patient
            const { data: patientProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', appointment.patient_id)
              .single();

            if (patientProfile) {
              (enrichedAppointment as any).patient = {
                profile: patientProfile
              };
            }

            return enrichedAppointment;
          })
        );

        setAppointments(enrichedAppointments as Appointment[]);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up realtime subscription
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: userRole === 'doctor' ? `doctor_id=eq.${userId}` : `patient_id=eq.${userId}`
        },
        (payload) => {
          console.log('Appointment change received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refetch to get complete data with relations for INSERT and UPDATE
            fetchAppointments();
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => 
              prev.filter(apt => apt.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  return { appointments, loading, refetch: () => {
    // Trigger refetch if needed
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  }};
};