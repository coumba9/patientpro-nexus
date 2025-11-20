import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  created_at: string;
  role: 'admin' | 'doctor' | 'patient';
  status: 'active' | 'blocked' | 'pending';
  last_login: string | null;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    pending: 0,
    patients: 0,
    doctors: 0,
    admins: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

      // Fetch doctors to check verification status
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, is_verified');

      const doctorsMap = new Map(doctorsData?.map(d => [d.id, d.is_verified]) || []);

      // Combine data
      const usersWithRoles: AdminUser[] = (profilesData || []).map((profile: any) => {
        const role = rolesMap.get(profile.id) || 'patient';
        const isDoctor = role === 'doctor';
        const isDoctorVerified = isDoctor ? doctorsMap.get(profile.id) : true;
        
        // Determine status
        let status: 'active' | 'blocked' | 'pending' = 'active';
        if (isDoctor && !isDoctorVerified) {
          status = 'pending';
        }

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number,
          created_at: profile.created_at,
          role: role as 'admin' | 'doctor' | 'patient',
          status,
          last_login: null // TODO: track last login
        };
      });

      setUsers(usersWithRoles);

      // Calculate stats
      const stats = {
        total: usersWithRoles.length,
        active: usersWithRoles.filter(u => u.status === 'active').length,
        blocked: usersWithRoles.filter(u => u.status === 'blocked').length,
        pending: usersWithRoles.filter(u => u.status === 'pending').length,
        patients: usersWithRoles.filter(u => u.role === 'patient').length,
        doctors: usersWithRoles.filter(u => u.role === 'doctor').length,
        admins: usersWithRoles.filter(u => u.role === 'admin').length
      };

      setStats(stats);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, stats, refetch: fetchUsers };
};
