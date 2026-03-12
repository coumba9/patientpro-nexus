import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  date: string;
  patientName: string;
  doctorName: string;
  amount: number;
  status: string;
}

export const TransactionsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("id, date, patient_id, doctor_id, payment_amount, payment_status, payment_id, created_at")
          .not("payment_amount", "is", null)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        // Fetch profiles for all unique user IDs
        const userIds = new Set<string>();
        (appointments || []).forEach((a) => {
          userIds.add(a.patient_id);
          userIds.add(a.doctor_id);
        });

        const profileMap: Record<string, string> = {};
        const promises = Array.from(userIds).map(async (id) => {
          const { data } = await supabase.rpc("get_safe_profile", { target_user_id: id });
          if (data && data.length > 0) {
            profileMap[id] = `${data[0].first_name || ""} ${data[0].last_name || ""}`.trim() || "Inconnu";
          } else {
            profileMap[id] = "Inconnu";
          }
        });
        await Promise.all(promises);

        const txns: Transaction[] = (appointments || []).map((a) => ({
          id: a.payment_id || a.id.slice(0, 8).toUpperCase(),
          date: a.date,
          patientName: profileMap[a.patient_id] || "Inconnu",
          doctorName: profileMap[a.doctor_id] || "Inconnu",
          amount: Number(a.payment_amount) || 0,
          status: a.payment_status || "pending",
        }));

        setTransactions(txns);
      } catch (e) {
        console.error("Error fetching transactions:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": case "paid": return "default" as const;
      case "pending": return "secondary" as const;
      case "failed": case "refunded": return "destructive" as const;
      default: return "outline" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": case "paid": return "Payé";
      case "pending": return "En attente";
      case "failed": return "Échoué";
      case "refunded": return "Remboursé";
      default: return status;
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      "ID,Date,Patient,Médecin,Montant,Statut",
      ...filtered.map((t) => `${t.id},${t.date},${t.patientName},${t.doctorName},${t.amount},${getStatusLabel(t.status)}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des transactions</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une transaction..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="failed">Échoué</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Médecin</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Montant</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Aucune transaction trouvée</td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="p-4 font-mono text-sm">{t.id}</td>
                      <td className="p-4 text-sm">{new Date(t.date).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4 text-sm">{t.patientName}</td>
                      <td className="p-4 text-sm">{t.doctorName}</td>
                      <td className="p-4 font-semibold text-sm">{t.amount.toLocaleString()} FCFA</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(t.status)}>{getStatusLabel(t.status)}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
