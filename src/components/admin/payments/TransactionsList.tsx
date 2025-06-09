
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye } from "lucide-react";

const mockTransactions = [
  {
    id: "TXN-001",
    date: "2024-06-09",
    patient: "Marie Dupont",
    doctor: "Dr. Martin",
    amount: 50,
    method: "Carte",
    status: "completed"
  },
  {
    id: "TXN-002",
    date: "2024-06-09",
    patient: "Jean Bernard",
    doctor: "Dr. Leroy",
    amount: 75,
    method: "PayTech",
    status: "pending"
  },
  {
    id: "TXN-003",
    date: "2024-06-08",
    patient: "Sophie Martin",
    doctor: "Dr. Dubois",
    amount: 60,
    method: "Virement",
    status: "failed"
  },
];

export const TransactionsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Complété";
      case "pending": return "En attente";
      case "failed": return "Échoué";
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des transactions</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une transaction..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="completed">Complété</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="failed">Échoué</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">ID Transaction</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Patient</th>
                <th className="text-left p-4">Médecin</th>
                <th className="text-left p-4">Montant</th>
                <th className="text-left p-4">Méthode</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{transaction.id}</td>
                  <td className="p-4">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="p-4">{transaction.patient}</td>
                  <td className="p-4">{transaction.doctor}</td>
                  <td className="p-4 font-semibold">{transaction.amount} €</td>
                  <td className="p-4">{transaction.method}</td>
                  <td className="p-4">
                    <Badge variant={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
