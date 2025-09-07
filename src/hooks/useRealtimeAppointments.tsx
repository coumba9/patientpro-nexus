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
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq(userRole === 'doctor' ? 'doctor_id' : 'patient_id', userId)
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching appointments:', error);
          return;
        }

        setAppointments(data as Appointment[] || []);
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
          
          if (payload.eventType === 'INSERT') {
            fetchAppointments(); // Refetch to get complete data with relations
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev => 
              prev.map(apt => 
                apt.id === payload.new.id 
                  ? { ...apt, ...payload.new }
                  : apt
              )
            );
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