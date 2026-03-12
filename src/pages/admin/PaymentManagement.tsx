import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, TrendingUp, Users, FileText } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PaymentOverview } from "@/components/admin/payments/PaymentOverview";
import { TransactionsList } from "@/components/admin/payments/TransactionsList";
import { PaymentSettings } from "@/components/admin/payments/PaymentSettings";
import { AdminExportDialog } from "@/components/admin/export/AdminExportDialog";
import { useAdminPayments } from "@/hooks/useAdminPayments";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const paymentColumns = [
  { key: "id", label: "ID" },
  { key: "date", label: "Date" },
  { key: "patient", label: "Patient" },
  { key: "doctor", label: "Médecin" },
  { key: "amount", label: "Montant (FCFA)" },
  { key: "status", label: "Statut" },
];

const appointmentColumns = [
  { key: "date", label: "Date" },
  { key: "time", label: "Heure" },
  { key: "patient", label: "Patient" },
  { key: "doctor", label: "Médecin" },
  { key: "type", label: "Type" },
  { key: "mode", label: "Mode" },
  { key: "status", label: "Statut" },
  { key: "amount", label: "Montant (FCFA)" },
];

const statusLabels: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmé", completed: "Terminé",
  cancelled: "Annulé", paid: "Payé", failed: "Échoué", no_show: "Absent",
};

const PaymentManagement = () => {
  const { stats, loading } = useAdminPayments();
  const [paymentExportOpen, setPaymentExportOpen] = useState(false);
  const [appointmentExportOpen, setAppointmentExportOpen] = useState(false);

  const fetchPayments = async (startDate: Date | undefined, endDate: Date | undefined) => {
    let query = supabase
      .from("appointments")
      .select("id, date, patient_id, doctor_id, payment_amount, payment_status, payment_id")
      .not("payment_amount", "is", null)
      .order("date", { ascending: false });

    if (startDate) query = query.gte("date", format(startDate, "yyyy-MM-dd"));
    if (endDate) query = query.lte("date", format(endDate, "yyyy-MM-dd"));

    const { data, error } = await query;
    if (error) throw error;

    const userIds = new Set<string>();
    (data || []).forEach((a) => { userIds.add(a.patient_id); userIds.add(a.doctor_id); });
    const profileMap: Record<string, string> = {};
    await Promise.all(Array.from(userIds).map(async (id) => {
      const { data: p } = await supabase.rpc("get_safe_profile", { target_user_id: id });
      profileMap[id] = p?.[0] ? `${p[0].first_name || ""} ${p[0].last_name || ""}`.trim() : "Inconnu";
    }));

    return (data || []).map((a) => ({
      id: a.payment_id || a.id.slice(0, 8).toUpperCase(),
      date: format(new Date(a.date), "dd/MM/yyyy", { locale: fr }),
      patient: profileMap[a.patient_id] || "Inconnu",
      doctor: profileMap[a.doctor_id] || "Inconnu",
      amount: Number(a.payment_amount) || 0,
      status: statusLabels[a.payment_status || "pending"] || a.payment_status,
    }));
  };

  const fetchAppointments = async (startDate: Date | undefined, endDate: Date | undefined) => {
    let query = supabase
      .from("appointments")
      .select("id, date, time, patient_id, doctor_id, type, mode, status, payment_amount")
      .order("date", { ascending: false });

    if (startDate) query = query.gte("date", format(startDate, "yyyy-MM-dd"));
    if (endDate) query = query.lte("date", format(endDate, "yyyy-MM-dd"));

    const { data, error } = await query;
    if (error) throw error;

    const userIds = new Set<string>();
    (data || []).forEach((a) => { userIds.add(a.patient_id); userIds.add(a.doctor_id); });
    const profileMap: Record<string, string> = {};
    await Promise.all(Array.from(userIds).map(async (id) => {
      const { data: p } = await supabase.rpc("get_safe_profile", { target_user_id: id });
      profileMap[id] = p?.[0] ? `${p[0].first_name || ""} ${p[0].last_name || ""}`.trim() : "Inconnu";
    }));

    return (data || []).map((a) => ({
      date: format(new Date(a.date), "dd/MM/yyyy", { locale: fr }),
      time: a.time,
      patient: profileMap[a.patient_id] || "Inconnu",
      doctor: profileMap[a.doctor_id] || "Inconnu",
      type: a.type || "consultation",
      mode: a.mode === "in_person" ? "Présentiel" : "Téléconsultation",
      status: statusLabels[a.status] || a.status,
      amount: Number(a.payment_amount) || 0,
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestion des paiements</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAppointmentExportOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Exporter RDV
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPaymentExportOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Exporter Paiements
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">...</div> : (
                  <>
                    <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} FCFA</div>
                    <p className="text-xs text-muted-foreground">{stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth.toFixed(1)}% par rapport au mois dernier</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">...</div> : (
                  <><div className="text-2xl font-bold">{stats.totalTransactions}</div><p className="text-xs text-muted-foreground">Ce mois-ci</p></>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">...</div> : (
                  <><div className="text-2xl font-bold">{stats.successRate}%</div><p className="text-xs text-muted-foreground">Des paiements réussis</p></>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients payants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">...</div> : (
                  <><div className="text-2xl font-bold">{stats.payingCustomers}</div><p className="text-xs text-muted-foreground">Ce mois-ci</p></>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><PaymentOverview /></TabsContent>
            <TabsContent value="transactions"><TransactionsList /></TabsContent>
            <TabsContent value="settings"><PaymentSettings /></TabsContent>
          </Tabs>
        </div>
      </div>

      <AdminExportDialog
        open={paymentExportOpen}
        onOpenChange={setPaymentExportOpen}
        title="Exporter les paiements"
        columns={paymentColumns}
        fetchData={fetchPayments}
        filePrefix="paiements_export"
      />
      <AdminExportDialog
        open={appointmentExportOpen}
        onOpenChange={setAppointmentExportOpen}
        title="Exporter les rendez-vous"
        columns={appointmentColumns}
        fetchData={fetchAppointments}
        filePrefix="rendez_vous_export"
      />
    </div>
  );
};

export default PaymentManagement;
