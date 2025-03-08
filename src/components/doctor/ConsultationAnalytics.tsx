
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const monthlyAppointmentsData = [
  { month: "Jan", consultations: 35, teleconsultations: 22 },
  { month: "Fév", consultations: 28, teleconsultations: 18 },
  { month: "Mar", consultations: 42, teleconsultations: 24 },
  { month: "Avr", consultations: 38, teleconsultations: 27 },
  { month: "Mai", consultations: 45, teleconsultations: 30 },
  { month: "Juin", consultations: 50, teleconsultations: 35 },
];

const cancellationReasons = [
  { name: "Empêchement", value: 45, color: "#3b82f6" },
  { name: "Raison médicale", value: 28, color: "#10b981" },
  { name: "Autre RDV médical", value: 15, color: "#f59e0b" },
  { name: "Résolution du problème", value: 12, color: "#6366f1" },
];

const weeklyTrend = [
  { day: "Lun", consultations: 8 },
  { day: "Mar", consultations: 10 },
  { day: "Mer", consultations: 7 },
  { day: "Jeu", consultations: 12 },
  { day: "Ven", consultations: 9 },
  { day: "Sam", consultations: 4 },
  { day: "Dim", consultations: 0 },
];

const consultationTypes = [
  { type: "Consultation initiale", count: 124, percentage: "31%" },
  { type: "Suivi régulier", count: 185, percentage: "46%" },
  { type: "Renouvellement ordonnance", count: 78, percentage: "19%" },
  { type: "Urgence", count: 15, percentage: "4%" },
];

export const ConsultationAnalytics = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Évolution des consultations par mois</CardTitle>
          <CardDescription>
            Nombre de consultations en présentiel et téléconsultations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyAppointmentsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} rendez-vous`]} 
                  labelFormatter={(label) => `Mois de ${label}`}
                />
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
                  <Tooltip 
                    formatter={(value) => [`${value}%`]}
                    labelFormatter={(label) => `Motif: ${label}`}
                  />
                  <Pie
                    data={cancellationReasons}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {cancellationReasons.map((entry, index) => (
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
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} consultations`]}
                    labelFormatter={(label) => `Jour: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="consultations"
                    name="Consultations"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type de consultation</TableHead>
                <TableHead className="text-right">Nombre</TableHead>
                <TableHead className="text-right">Pourcentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultationTypes.map((type, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{type.type}</TableCell>
                  <TableCell className="text-right">{type.count}</TableCell>
                  <TableCell className="text-right">{type.percentage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
