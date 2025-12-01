import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  created_at: string;
  doctor?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface PatientNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  title: string;
  content: string;
  created_at: string;
}

export const useMedicalRecords = (patientId: string | null, doctorId: string | null) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (recordsError) {
        console.error('Error fetching medical records:', recordsError);
      } else {
        // Fetch doctor profiles for the records
        const doctorIds = [...new Set((recordsData || []).map(r => r.doctor_id))];
        
        if (doctorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', doctorIds);
          
          const profileMap = new Map((profiles || []).map(p => [p.id, p]));
          
          const enrichedRecords = (recordsData || []).map(record => ({
            ...record,
            doctor: profileMap.get(record.doctor_id) || null
          }));
          
          setRecords(enrichedRecords);
        } else {
          setRecords(recordsData || []);
        }
      }

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
      } else {
        setNotes(notesData || []);
      }
    } catch (error) {
      console.error('Error fetching medical data:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRecords();

    // Subscribe to changes
    const recordsChannel = supabase
      .channel('medical-records-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medical_records',
          filter: patientId ? `patient_id=eq.${patientId}` : undefined
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    const notesChannel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: patientId ? `patient_id=eq.${patientId}` : undefined
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recordsChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [patientId, fetchRecords]);

  return { records, notes, loading, refetch: fetchRecords };
};
