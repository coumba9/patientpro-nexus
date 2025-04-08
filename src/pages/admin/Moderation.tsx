
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Données simulées pour les signalements
const reports = [
  {
    id: 1,
    type: "Commentaire inapproprié",
    reporter: "Seynabou Seye",
    reported: "Dr. Ahmadou Fall",
    date: "2024-02-19",
    status: "En attente",
    content: "Contenu offensant dans un commentaire...",
  },
  {
    id: 2,
    type: "Comportement suspect",
    reporter: "Sophie Ndiaye",
    reported: "Dr. Amadou Faye",
    date: "2024-02-18",
    status: "En attente",
    content: "Activité suspecte détectée...",
  },
  {
    id: 3,
    type: "Information erronée",
    reporter: "Ansou Fall",
    reported: "Dr. Marie Fall",
    date: "2024-02-17",
    status: "En attente",
    content: "Diffusion d'informations médicales incorrectes...",
  },
];

const ModrationPage = () => {
  const [activeReports, setActiveReports] = useState(reports);

  const handleApprove = (reportId: number) => {
    setActiveReports(reports.filter((report) => report.id !== reportId));
    toast.success("Le signalement a été résolu et marqué comme traité");
  };

  const handleReject = (reportId: number) => {
    setActiveReports(reports.filter((report) => report.id !== reportId));
    toast.success("Le signalement a été rejeté");
  };

  const handleBan = (reportId: number) => {
    setActiveReports(reports.filter((report) => report.id !== reportId));
    toast.success("L'utilisateur a été banni");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <h2 className="font-semibold text-lg mb-4">Administration</h2>
            <Link to="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Utilisateurs
              </Button>
            </Link>
            <Link to="/admin/moderation">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Modération
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <BarChart className="mr-2 h-5 w-5" />
                Statistiques
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Modération des signalements</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Signalé par</TableHead>
                    <TableHead>Utilisateur signalé</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.type}</TableCell>
                      <TableCell>{report.reporter}</TableCell>
                      <TableCell>{report.reported}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => {
                              toast.info(report.content);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-red-600 hover:text-red-700"
                            onClick={() => handleReject(report.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-destructive hover:text-destructive"
                            onClick={() => handleBan(report.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Bannir
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(report.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Résoudre
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {activeReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun signalement en attente
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModrationPage;
