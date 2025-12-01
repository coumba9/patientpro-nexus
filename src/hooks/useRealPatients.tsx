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
  phone_number?: string;
  email?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
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
        const transformedPatients: RealPatient[] = data.map((patient: any) => {
          const profile = patient.profile;
          const birthDate = patient.birth_date ? new Date(patient.birth_date) : null;
          const age = birthDate 
            ? new Date().getFullYear() - birthDate.getFullYear()
            : 0;

          const lastName = profile?.last_name || '';
          const firstName = profile?.first_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Patient';

          return {
            id: patient.id,
            name: fullName,
            age,
            gender: patient.gender || 'Non spécifié',
            contact: profile?.phone_number || profile?.email || patient.phone_number || 'Non disponible',
            lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Non disponible',
            birth_date: patient.birth_date,
            blood_type: patient.blood_type,
            allergies: patient.allergies,
            phone_number: profile?.phone_number || patient.phone_number,
            email: profile?.email,
            profile
          };
        });

        setPatients(transformedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
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
          table: 'appointments'
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
