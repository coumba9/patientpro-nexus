import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminPatient {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  birth_date: string | null;
  gender: string | null;
  blood_type: string | null;
  created_at: string;
  appointment_count: number;
  last_appointment: string | null;
  status: 'active' | 'inactive';
}

export const useAdminPatients = () => {
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Fetch patients with profile data
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          id,
          birth_date,
          gender,
          blood_type,
          phone_number,
          created_at,
          profiles!inner(
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Fetch appointment counts for each patient
      const patientsWithStats = await Promise.all(
        (patientsData || []).map(async (patient: any) => {
          const { count } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', patient.id);

          const { data: lastAppt } = await supabase
            .from('appointments')
            .select('date')
            .eq('patient_id', patient.id)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();

          const lastAppointmentDate = lastAppt?.date || null;
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          const isActive = lastAppointmentDate && 
            new Date(lastAppointmentDate) > threeMonthsAgo;

          return {
            id: patient.id,
            first_name: patient.profiles?.first_name || null,
            last_name: patient.profiles?.last_name || null,
            email: patient.profiles?.email || null,
            phone_number: patient.phone_number || patient.profiles?.phone_number || null,
            birth_date: patient.birth_date,
            gender: patient.gender,
            blood_type: patient.blood_type,
            created_at: patient.created_at,
            appointment_count: count || 0,
            last_appointment: lastAppointmentDate,
            status: isActive ? 'active' as const : 'inactive' as const
          };
        })
      );

      setPatients(patientsWithStats);

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      const newThisMonth = patientsWithStats.filter(
        p => new Date(p.created_at) > thirtyDaysAgo
      ).length;

      const activePatients = patientsWithStats.filter(p => p.status === 'active').length;

      setStats({
        total: patientsWithStats.length,
        active: activePatients,
        inactive: patientsWithStats.length - activePatients,
        newThisMonth
      });

    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, stats, refetch: fetchPatients };
};
