import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const PaymentOverview = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      try {
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("date, payment_amount, payment_status")
          .not("payment_amount", "is", null);

        if (error) throw error;
        const appts = appointments || [];

        // Monthly revenue (last 6 months)
        const now = new Date();
        const monthly: { month: string; revenue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const rev = appts
            .filter((a) => {
              const ad = new Date(a.date);
              return ad >= d && ad < next && (a.payment_status === "paid" || a.payment_status === "completed");
            })
            .reduce((sum, a) => sum + (Number(a.payment_amount) || 0), 0);
          monthly.push({ month: MONTHS_FR[d.getMonth()], revenue: rev });
        }
        setMonthlyRevenue(monthly);

        // Payment status distribution
        const statusMap: Record<string, number> = {};
        appts.forEach((a) => {
          const s = a.payment_status || "pending";
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        const labels: Record<string, string> = { paid: "Payé", completed: "Complété", pending: "En attente", failed: "Échoué", refunded: "Remboursé" };
        const statuses = Object.entries(statusMap)
          .sort((a, b) => b[1] - a[1])
          .map(([key, val], i) => ({
            name: labels[key] || key,
            value: val,
            color: COLORS[i % COLORS.length],
          }));
        setStatusData(statuses.length > 0 ? statuses : [{ name: "Aucun paiement", value: 1, color: COLORS[0] }]);
      } catch (e) {
        console.error("Error fetching payment data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="pt-6"><Skeleton className="h-[300px]" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-[300px]" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenus mensuels</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, "Revenus"]} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statuts de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
