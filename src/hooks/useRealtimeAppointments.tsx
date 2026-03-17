import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/api/interfaces';

export const useRealtimeAppointments = (userId: string | null, userRole: 'doctor' | 'patient' | null) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const updatePastAppointments = async (appointmentsList: Appointment[]) => {
    const now = new Date();
    const updatesToMake = appointmentsList
      .filter(apt => {
        const dt = new Date(`${apt.date}T${apt.time}`);
        return dt < now && ['pending', 'confirmed', 'awaiting_patient_confirmation'].includes(apt.status);
      })
      .map(apt => apt.id);

    if (updatesToMake.length > 0) {
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .in('id', updatesToMake);
    }
  };

  useEffect(() => {
    if (!userId || !userRole) {
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq(userRole === 'doctor' ? 'doctor_id' : 'patient_id', userId)
          .order('date', { ascending: true });

        if (appointmentsError || !appointmentsData || appointmentsData.length === 0) {
          setAppointments([]);
          return;
        }

        // Batch: collect unique doctor and patient IDs
        const doctorIds = [...new Set(appointmentsData.map(a => a.doctor_id))];
        const patientIds = [...new Set(appointmentsData.map(a => a.patient_id))];

        // Fetch all doctor briefs and patient profiles in parallel
        const [doctorResults, patientProfiles] = await Promise.all([
          Promise.all(doctorIds.map(id =>
            supabase.rpc('get_doctor_brief', { doctor_id: id }).single().then(r => ({ id, data: r.data }))
          )),
          supabase.from('profiles').select('id, first_name, last_name, email').in('id', patientIds)
        ]);

        // Build lookup maps
        const doctorMap = new Map<string, any>();
        for (const r of doctorResults) {
          if (r.data) doctorMap.set(r.id, r.data);
        }

        const patientMap = new Map<string, any>();
        for (const p of (patientProfiles.data || [])) {
          patientMap.set(p.id, p);
        }

        // Enrich in one pass
        const enriched = appointmentsData.map(apt => {
          const doc = doctorMap.get(apt.doctor_id);
          const pat = patientMap.get(apt.patient_id);
          return {
            ...apt,
            doctor: doc ? {
              id: doc.id,
              license_number: '',
              years_of_experience: 0,
              specialty_id: doc.specialty_id,
              profile: { first_name: doc.first_name, last_name: doc.last_name, email: doc.email },
              specialty: doc.specialty_name ? { id: doc.specialty_id, name: doc.specialty_name } : null
            } : undefined,
            patient: pat ? { profile: pat } : undefined
          };
        });

        setAppointments(enriched as Appointment[]);
        await updatePastAppointments(enriched as Appointment[]);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    const intervalId = setInterval(fetchAppointments, 5 * 60 * 1000);

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
          if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
          } else {
            fetchAppointments();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      clearInterval(intervalId);
    };
  }, [userId, userRole]);

  return { appointments, loading, refetch: () => {} };
};
