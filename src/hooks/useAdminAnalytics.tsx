import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyData {
  name: string;
  users: number;
  consultations: number;
  appointments: number;
}

export const useAdminAnalytics = () => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Obtenir les données des 6 derniers mois
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
        const now = new Date();
        const analyticsData: MonthlyData[] = [];

        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

          // Compter les nouveaux utilisateurs ce mois
          const { count: usersCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", monthDate.toISOString())
            .lt("created_at", nextMonthDate.toISOString());

          // Compter les consultations (rendez-vous complétés) ce mois
          const { count: consultationsCount } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed")
            .gte("created_at", monthDate.toISOString())
            .lt("created_at", nextMonthDate.toISOString());

          // Compter tous les rendez-vous créés ce mois
          const { count: appointmentsCount } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .gte("created_at", monthDate.toISOString())
            .lt("created_at", nextMonthDate.toISOString());

          analyticsData.push({
            name: months[(monthDate.getMonth()) % 12],
            users: usersCount || 0,
            consultations: consultationsCount || 0,
            appointments: appointmentsCount || 0,
          });
        }

        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { data, loading };
};
