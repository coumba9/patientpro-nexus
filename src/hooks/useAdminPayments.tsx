import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStats {
  monthlyRevenue: number;
  totalTransactions: number;
  successRate: number;
  payingCustomers: number;
  revenueGrowth: number;
  transactionsThisMonth: number;
}

interface Transaction {
  id: string;
  patient_id: string;
  doctor_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
}

export const useAdminPayments = () => {
  const [stats, setStats] = useState<PaymentStats>({
    monthlyRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    payingCustomers: 0,
    revenueGrowth: 0,
    transactionsThisMonth: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);

      // Get current month boundaries
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch appointments with confirmed status (completed payments)
      const { data: currentMonthAppointments, error: currentError } = await supabase
        .from("appointments")
        .select("*, patients(id), doctors(id)")
        .gte("created_at", firstDayOfMonth.toISOString())
        .in("status", ["confirmed", "completed"]);

      if (currentError) throw currentError;

      const { data: lastMonthAppointments, error: lastError } = await supabase
        .from("appointments")
        .select("*")
        .gte("created_at", firstDayOfLastMonth.toISOString())
        .lte("created_at", lastDayOfLastMonth.toISOString())
        .in("status", ["confirmed", "completed"]);

      if (lastError) throw lastError;

      // Calculate stats (assuming each appointment is 5000 FCFA)
      const appointmentPrice = 5000;
      const currentMonthRevenue = (currentMonthAppointments?.length || 0) * appointmentPrice;
      const lastMonthRevenue = (lastMonthAppointments?.length || 0) * appointmentPrice;
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Get unique patients
      const uniquePatients = new Set(
        currentMonthAppointments?.map((app: any) => app.patient_id) || []
      );

      // Calculate success rate (confirmed + completed / total)
      const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth.toISOString());

      const successRate = totalAppointments && totalAppointments > 0
        ? ((currentMonthAppointments?.length || 0) / totalAppointments) * 100
        : 0;

      setStats({
        monthlyRevenue: currentMonthRevenue,
        totalTransactions: currentMonthAppointments?.length || 0,
        successRate: Math.round(successRate * 10) / 10,
        payingCustomers: uniquePatients.size,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        transactionsThisMonth: currentMonthAppointments?.length || 0,
      });

      // Format transactions for display
      const { data: recentAppointments, error: recentError } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_id,
          doctor_id,
          status,
          mode,
          created_at,
          patients!inner(id),
          doctors!inner(id)
        `)
        .in("status", ["confirmed", "completed"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (recentError) throw recentError;

      // Get patient and doctor names
      const formattedTransactions = await Promise.all(
        (recentAppointments || []).map(async (apt: any) => {
          const { data: patientProfile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", apt.patient_id)
            .single();

          const { data: doctorProfile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", apt.doctor_id)
            .single();

          return {
            id: apt.id,
            patient_id: apt.patient_id,
            doctor_id: apt.doctor_id,
            amount: appointmentPrice,
            status: apt.status,
            payment_method: apt.mode === "teleconsultation" ? "En ligne" : "Sur place",
            created_at: apt.created_at,
            patient_name: patientProfile
              ? `${patientProfile.first_name} ${patientProfile.last_name}`
              : "Patient inconnu",
            doctor_name: doctorProfile
              ? `Dr. ${doctorProfile.first_name} ${doctorProfile.last_name}`
              : "Médecin inconnu",
          };
        })
      );

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, transactions, loading, refetch: fetchPaymentData };
};
