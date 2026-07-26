
import { BaseService, TableName } from "../base/base.service";
import { Doctor } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class DoctorService extends BaseService<Doctor> {
  constructor() {
    super('doctors' as TableName);
  }

  // Get average rating for a doctor (aggregated server-side, no personal data exposed)
  async getDoctorRating(doctorId: string): Promise<number> {
    const stats = await this.getDoctorsRatings([doctorId]);
    return stats[doctorId]?.average ?? 0;
  }

  // Get aggregated ratings for multiple doctors at once (average + count)
  async getDoctorsRatings(doctorIds: string[]): Promise<Record<string, { average: number; count: number }>> {
    if (doctorIds.length === 0) return {};

    const { data, error } = await (supabase.rpc as any)('get_doctor_rating_stats', {
      doctor_ids: doctorIds,
    });

    if (error || !data) {
      return {};
    }

    const results: Record<string, { average: number; count: number }> = {};
    (data as Array<{ doctor_id: string; average_rating: number | string; rating_count: number | string }>).forEach((row) => {
      results[row.doctor_id] = {
        average: Number(row.average_rating) || 0,
        count: Number(row.rating_count) || 0,
      };
    });

    return results;
  }


  async getDoctorsWithDetails(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .rpc('get_available_doctors', { 
        specialty_filter: null, 
        verified_only: false 
      });
    
    if (error) {
      console.error('Error fetching doctors with details:', error);
      throw error;
    }
    
    const doctors = (data || []).map((doctor: any) => ({
      id: doctor.id,
      specialty_id: doctor.specialty_id,
      years_of_experience: doctor.years_of_experience,
      is_verified: doctor.is_verified,
      license_number: doctor.license_number,
      profile: {
        first_name: doctor.first_name,
        last_name: doctor.last_name,
        email: doctor.email
      },
      specialty: doctor.specialty_name ? {
        id: doctor.specialty_id,
        name: doctor.specialty_name
      } : null
    })) as Doctor[];
    
    // Fetch ratings for all doctors
    const doctorIds = doctors.map(d => d.id);
    const ratings = await this.getDoctorsRatings(doctorIds);
    
    // Add ratings to doctors
    return doctors.map(d => ({
      ...d,
      average_rating: ratings[d.id]?.average || 0,
      rating_count: ratings[d.id]?.count || 0
    }));
  }

  async getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
    const { data, error } = await supabase
      .rpc('get_available_doctors', { 
        specialty_filter: specialtyId, 
        verified_only: true 
      });
    
    if (error) {
      console.error('Error fetching doctors by specialty:', error);
      throw error;
    }
    
    return (data || []).map((doctor: any) => ({
      id: doctor.id,
      specialty_id: doctor.specialty_id,
      years_of_experience: doctor.years_of_experience,
      is_verified: doctor.is_verified,
      license_number: doctor.license_number,
      profile: {
        first_name: doctor.first_name,
        last_name: doctor.last_name,
        email: doctor.email
      },
      specialty: doctor.specialty_name ? {
        id: doctor.specialty_id,
        name: doctor.specialty_name
      } : null
    })) as Doctor[];
  }

  async verifyDoctor(id: string, verified: boolean): Promise<Doctor> {
    return this.update(id, { is_verified: verified });
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        specialty:specialty_id (id, name),
        profile:id (first_name, last_name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching doctor by ID:', error);
      return null;
    }
    
    return data as unknown as Doctor;
  }
}

export const doctorService = new DoctorService();
