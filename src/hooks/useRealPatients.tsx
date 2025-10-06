import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { patientService } from '@/api/services/patient.service';

export interface RealPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  lastVisit: string;
  birth_date?: string;
  blood_type?: string;
  allergies?: string[];
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export const useRealPatients = (doctorId: string | null) => {
  const [patients, setPatients] = useState<RealPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatientsByDoctor(doctorId);
        
        // Transform to the expected format
        const transformedPatients: RealPatient[] = data.map(patient => {
          const profile = patient.profile;
          const birthDate = patient.birth_date ? new Date(patient.birth_date) : null;
          const age = birthDate 
            ? new Date().getFullYear() - birthDate.getFullYear()
            : 0;

          return {
            id: patient.id,
            name: profile ? `${profile.first_name} ${profile.last_name}` : 'Patient',
            age,
            gender: patient.gender || 'Non spécifié',
            contact: profile?.email || 'Non disponible',
            lastVisit: 'Non disponible', // Will be updated when we query appointments
            birth_date: patient.birth_date,
            blood_type: patient.blood_type,
            allergies: patient.allergies,
            profile
          };
        });

        setPatients(transformedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();

    // Subscribe to changes
    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        () => {
          fetchPatients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  return { patients, loading };
};
