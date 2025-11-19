import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  admins: number;
  totalDoctors: number;
  verifiedDoctors: number;
  pendingDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    admins: 0,
    totalDoctors: 0,
    verifiedDoctors: 0,
    pendingDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Compter tous les utilisateurs via profiles
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Compter les admins
        const { count: admins } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");

        // Compter tous les médecins
        const { count: totalDoctors } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true });

        // Compter les médecins vérifiés
        const { count: verifiedDoctors } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true);

        // Compter les applications en attente
        const { count: pendingDoctors } = await supabase
          .from("doctor_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // Compter tous les patients
        const { count: totalPatients } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        // Compter tous les rendez-vous
        const { count: totalAppointments } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true });

        // Compter les rendez-vous terminés
        const { count: completedAppointments } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed");

        // Compter les rendez-vous en attente
        const { count: pendingAppointments } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // Compter les rendez-vous annulés
        const { count: cancelledAppointments } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "cancelled");

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: (totalUsers || 0) - 0, // TODO: implémenter la logique d'utilisateurs actifs
          blockedUsers: 0, // TODO: implémenter la logique d'utilisateurs bloqués
          admins: admins || 0,
          totalDoctors: totalDoctors || 0,
          verifiedDoctors: verifiedDoctors || 0,
          pendingDoctors: pendingDoctors || 0,
          totalPatients: totalPatients || 0,
          totalAppointments: totalAppointments || 0,
          completedAppointments: completedAppointments || 0,
          pendingAppointments: pendingAppointments || 0,
          cancelledAppointments: cancelledAppointments || 0,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
