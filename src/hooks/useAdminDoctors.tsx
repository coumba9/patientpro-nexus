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

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select("*");

      if (doctorsError) throw doctorsError;

      const formattedDoctors = await Promise.all(
        (doctorsData || []).map(async (doctor: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, email, phone_number")
            .eq("id", doctor.id)
            .single();

          const { data: specialty } = await supabase
            .from("specialties")
            .select("id, name")
            .eq("id", doctor.specialty_id)
            .single();

          return {
            id: doctor.id,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            email: profile?.email || null,
            specialty_name: specialty?.name || null,
            specialty_id: doctor.specialty_id,
            is_verified: doctor.is_verified,
            years_of_experience: doctor.years_of_experience,
            license_number: doctor.license_number,
            phone_number: profile?.phone_number || null,
            created_at: doctor.created_at,
          };
        })
      );

      setDoctors(formattedDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, refetch: fetchDoctors };
};
