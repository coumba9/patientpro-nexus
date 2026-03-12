import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const invokeAdmin = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('admin-manage-users', {
    body,
  });
  if (error) throw new Error(error.message || 'Edge function error');
  if (data?.error) throw new Error(data.error);
  return data;
};

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, active: 0, blocked: 0, pending: 0,
    patients: 0, doctors: 0, admins: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone_number, created_at')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, is_verified');
      const doctorsMap = new Map(doctorsData?.map(d => [d.id, d.is_verified]) || []);

      const usersWithRoles: AdminUser[] = (profilesData || []).map((profile: any) => {
        const role = rolesMap.get(profile.id) || 'patient';
        const isDoctor = role === 'doctor';
        const isDoctorVerified = isDoctor ? doctorsMap.get(profile.id) : true;

        let status: 'active' | 'blocked' | 'pending' = 'active';
        if (isDoctor && !isDoctorVerified) status = 'pending';

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number,
          created_at: profile.created_at,
          role: role as 'admin' | 'doctor' | 'patient',
          status,
          last_login: null,
        };
      });

      setUsers(usersWithRoles);
      setStats({
        total: usersWithRoles.length,
        active: usersWithRoles.filter(u => u.status === 'active').length,
        blocked: usersWithRoles.filter(u => u.status === 'blocked').length,
        pending: usersWithRoles.filter(u => u.status === 'pending').length,
        patients: usersWithRoles.filter(u => u.role === 'patient').length,
        doctors: usersWithRoles.filter(u => u.role === 'doctor').length,
        admins: usersWithRoles.filter(u => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: 'admin' | 'doctor' | 'patient') => {
    await invokeAdmin({ action: 'update_role', user_id: userId, new_role: newRole });
    toast.success('Rôle mis à jour');
    await fetchUsers();
  };

  const updateStatus = async (userId: string, isBlocked: boolean) => {
    await invokeAdmin({ action: 'update_status', user_id: userId, is_blocked: isBlocked });
    toast.success(isBlocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué');
    await fetchUsers();
  };

  const updateProfile = async (userId: string, data: { first_name: string; last_name: string; email?: string; phone_number?: string }) => {
    await invokeAdmin({ action: 'update_profile', user_id: userId, ...data });
    toast.success('Profil mis à jour');
    await fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    await invokeAdmin({ action: 'delete_user', user_id: userId });
    toast.success('Utilisateur supprimé');
    await fetchUsers();
  };

  return { users, loading, stats, refetch: fetchUsers, updateRole, updateStatus, updateProfile, deleteUser };
};
