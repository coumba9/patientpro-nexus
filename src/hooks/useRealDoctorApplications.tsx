import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DoctorApplicationWithDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  specialty_id: string | null;
  specialty_name?: string;
  license_number: string;
  years_of_experience: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  diploma_url: string | null;
  license_url: string | null;
  other_documents_urls: string[] | null;
}

export const useRealDoctorApplications = () => {
  const [applications, setApplications] = useState<DoctorApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('doctor-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const { data: applicationsData, error } = await supabase
        .from('doctor_applications')
        .select(`
          *,
          specialties(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedApplications = (applicationsData || []).map((app: any) => ({
        ...app,
        specialty_name: app.specialties?.name || 'Non spécifié'
      }));

      setApplications(formattedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading, refetch: fetchApplications };
};
