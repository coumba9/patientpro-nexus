import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/api/interfaces';

export const useRealtimeAppointments = (userId: string | null, userRole: 'doctor' | 'patient' | null) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour vérifier et mettre à jour les rendez-vous passés
  const updatePastAppointments = async (appointmentsList: Appointment[]) => {
    const now = new Date();
    const updatesToMake = [];

    for (const appointment of appointmentsList) {
      // Créer la date et heure du rendez-vous
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      
      // Si le rendez-vous est passé et toujours en statut pending ou confirmed
      if (appointmentDateTime < now && 
          (appointment.status === 'pending' || 
           appointment.status === 'confirmed' || 
           appointment.status === 'awaiting_patient_confirmation')) {
        updatesToMake.push(appointment.id);
      }
    }

    // Mettre à jour tous les rendez-vous passés en batch
    if (updatesToMake.length > 0) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .in('id', updatesToMake);

        if (error) {
          console.error('Error updating past appointments:', error);
        } else {
          console.log(`${updatesToMake.length} rendez-vous passés mis à jour`);
        }
      } catch (error) {
        console.error('Error updating past appointments:', error);
      }
    }
  };

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

            // Utiliser la fonction sécurisée pour récupérer les infos du médecin
            const { data: doctorBrief, error: doctorError } = await supabase
              .rpc('get_doctor_brief', { doctor_id: appointment.doctor_id })
              .single();

            if (doctorError) {
              console.error('Error fetching doctor brief:', doctorError);
            } else if (doctorBrief) {
              (enrichedAppointment as any).doctor = {
                id: doctorBrief.id,
                license_number: '',
                years_of_experience: 0,
                specialty_id: doctorBrief.specialty_id,
                profile: {
                  first_name: doctorBrief.first_name,
                  last_name: doctorBrief.last_name,
                  email: doctorBrief.email
                },
                specialty: doctorBrief.specialty_name ? {
                  id: doctorBrief.specialty_id,
                  name: doctorBrief.specialty_name
                } : null
              };
            }

            // Récupérer les infos du patient
            const { data: patientProfile, error: patientError } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', appointment.patient_id)
              .maybeSingle();

            if (patientError) console.error('Error fetching patient profile:', patientError);

            if (patientProfile) {
              (enrichedAppointment as any).patient = {
                profile: patientProfile
              };
            }

            return enrichedAppointment;
          })
        );

        setAppointments(enrichedAppointments as Appointment[]);
        
        // Vérifier et mettre à jour les rendez-vous passés
        await updatePastAppointments(enrichedAppointments as Appointment[]);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Vérifier les rendez-vous passés toutes les 5 minutes
    const intervalId = setInterval(() => {
      fetchAppointments();
    }, 5 * 60 * 1000); // 5 minutes

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
      channel.unsubscribe();
      clearInterval(intervalId);
    };
  }, [userId, userRole]);

  return { appointments, loading, refetch: () => {
    // Trigger refetch if needed
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  }};
};