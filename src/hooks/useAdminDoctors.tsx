import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Doctor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  specialty_name: string | null;
  specialty_id: string | null;
  is_verified: boolean;
  years_of_experience: number | null;
  license_number: string;
  phone_number: string | null;
  created_at: string;
}

export const useAdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("doctors")
          .select(`
            id,
            is_verified,
            years_of_experience,
            license_number,
            created_at,
            specialty_id,
            profiles!inner (
              first_name,
              last_name,
              email,
              phone_number
            ),
            specialties (
              id,
              name
            )
          `);

        if (error) throw error;

        const formattedDoctors = (data || []).map((doctor: any) => ({
          id: doctor.id,
          first_name: doctor.profiles?.first_name || null,
          last_name: doctor.profiles?.last_name || null,
          email: doctor.profiles?.email || null,
          specialty_name: doctor.specialties?.name || null,
          specialty_id: doctor.specialty_id,
          is_verified: doctor.is_verified,
          years_of_experience: doctor.years_of_experience,
          license_number: doctor.license_number,
          phone_number: doctor.profiles?.phone_number || null,
          created_at: doctor.created_at,
        }));

        setDoctors(formattedDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading, refetch: () => {} };
};
