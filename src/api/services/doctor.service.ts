
import { BaseService, TableName } from "../base/base.service";
import { Doctor } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class DoctorService extends BaseService<Doctor> {
  constructor() {
    super('doctors' as TableName);
  }

  // Get average rating for a doctor from ratings table
  async getDoctorRating(doctorId: string): Promise<number> {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('doctor_id', doctorId);
    
    if (error || !data || data.length === 0) {
      return 0;
    }
    
    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }

  // Get all ratings for multiple doctors at once
  async getDoctorsRatings(doctorIds: string[]): Promise<Record<string, number>> {
    if (doctorIds.length === 0) return {};
    
    const { data, error } = await supabase
      .from('ratings')
      .select('doctor_id, rating')
      .in('doctor_id', doctorIds);
    
    if (error || !data) {
      return {};
    }
    
    // Group ratings by doctor and calculate average
    const ratingsMap: Record<string, number[]> = {};
    data.forEach(r => {
      if (!ratingsMap[r.doctor_id]) {
        ratingsMap[r.doctor_id] = [];
      }
      ratingsMap[r.doctor_id].push(r.rating);
    });
    
    const averages: Record<string, number> = {};
    Object.entries(ratingsMap).forEach(([doctorId, ratings]) => {
      const sum = ratings.reduce((acc, r) => acc + r, 0);
      averages[doctorId] = Math.round((sum / ratings.length) * 10) / 10;
    });
    
    return averages;
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
      average_rating: ratings[d.id] || 0
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
