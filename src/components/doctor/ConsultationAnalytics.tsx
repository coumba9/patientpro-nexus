import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ef4444"];
const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export const ConsultationAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ month: string; consultations: number; teleconsultations: number }[]>([]);
  const [cancellationData, setCancellationData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; consultations: number }[]>([]);
  const [typeData, setTypeData] = useState<{ type: string; count: number; percentage: string }[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all appointments for this doctor
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("date, mode, status, type, cancellation_reason")
          .eq("doctor_id", user.id);

        if (error) throw error;
        const appts = appointments || [];

        // Monthly data (last 6 months)
        const now = new Date();
        const monthly: { month: string; consultations: number; teleconsultations: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const monthAppts = appts.filter((a) => {
            const ad = new Date(a.date);
            return ad >= d && ad < nextMonth;
          });
          monthly.push({
            month: MONTHS_FR[d.getMonth()],
            consultations: monthAppts.filter((a) => a.mode === "in_person").length,
            teleconsultations: monthAppts.filter((a) => a.mode === "teleconsultation" || a.mode === "online").length,
          });
        }
        setMonthlyData(monthly);

        // Cancellation reasons
        const cancelled = appts.filter((a) => a.status === "cancelled");
        const reasonMap: Record<string, number> = {};
        cancelled.forEach((a) => {
          const reason = a.cancellation_reason?.trim() || "Non spécifié";
          reasonMap[reason] = (reasonMap[reason] || 0) + 1;
        });
        const total = cancelled.length || 1;
        const cancReasons = Object.entries(reasonMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count], i) => ({
            name,
            value: Math.round((count / total) * 100),
            color: COLORS[i % COLORS.length],
          }));
        setCancellationData(cancReasons.length > 0 ? cancReasons : [{ name: "Aucune annulation", value: 100, color: COLORS[0] }]);

        // Weekly trend (current week based on all data)
        const weekly = DAYS_FR.map((day, i) => ({
          day,
          consultations: appts.filter((a) => new Date(a.date).getDay() === i && a.status !== "cancelled").length,
        }));
        // Reorder to start from Monday
        const reordered = [...weekly.slice(1), weekly[0]];
        setWeeklyData(reordered);

        // Consultation types
        const typeMap: Record<string, number> = {};
        appts.filter((a) => a.status !== "cancelled").forEach((a) => {
          const t = a.type || "consultation";
          typeMap[t] = (typeMap[t] || 0) + 1;
        });
        const totalActive = appts.filter((a) => a.status !== "cancelled").length || 1;
        const typeLabels: Record<string, string> = {
          consultation: "Consultation initiale",
          follow_up: "Suivi régulier",
          renewal: "Renouvellement ordonnance",
          emergency: "Urgence",
          teleconsultation: "Téléconsultation",
        };
        const types = Object.entries(typeMap)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({
            type: typeLabels[type] || type,
            count,
            percentage: `${Math.round((count / totalActive) * 100)}%`,
          }));
        setTypeData(types);
      } catch (e) {
        console.error("Error fetching analytics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Évolution des consultations par mois</CardTitle>
          <CardDescription>Nombre de consultations en présentiel et téléconsultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} rendez-vous`]} labelFormatter={(label) => `Mois de ${label}`} />
                <Legend />
                <Bar dataKey="consultations" name="Consultations présentielles" fill="#3b82f6" />
                <Bar dataKey="teleconsultations" name="Téléconsultations" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Motifs d'annulation</CardTitle>
            <CardDescription>Répartition des raisons d'annulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Pie data={cancellationData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={(entry) => `${entry.name}: ${entry.value}%`}>
                    {cancellationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendance hebdomadaire</CardTitle>
            <CardDescription>Nombre de consultations par jour de la semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} consultations`]} />
                  <Line type="monotone" dataKey="consultations" name="Consultations" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Types de consultations</CardTitle>
          <CardDescription>Répartition par type</CardDescription>
        </CardHeader>
        <CardContent>
          {typeData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune donnée disponible</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type de consultation</TableHead>
                  <TableHead className="text-right">Nombre</TableHead>
                  <TableHead className="text-right">Pourcentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typeData.map((type, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{type.type}</TableCell>
                    <TableCell className="text-right">{type.count}</TableCell>
                    <TableCell className="text-right">{type.percentage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
