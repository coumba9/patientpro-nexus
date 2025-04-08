
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
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Données simulées pour les signalements
const reports = [
  {
    id: 1,
    type: "Commentaire inapproprié",
    reporter: "Seynabou Seye",
    reported: "Dr. Ahmadou Fall",
    date: "2024-02-19",
    status: "En attente",
    content: "Contenu offensant dans un commentaire sur une question médicale. L'utilisateur a utilisé un langage agressif et des termes inappropriés envers un autre membre.",
  },
  {
    id: 2,
    type: "Comportement suspect",
    reporter: "Sophie Ndiaye",
    reported: "Dr. Amadou Faye",
    date: "2024-02-18",
    status: "En attente",
    content: "Activité suspecte détectée. Le médecin a demandé des informations personnelles qui ne semblent pas nécessaires au contexte médical et a proposé un échange hors plateforme.",
  },
  {
    id: 3,
    type: "Information erronée",
    reporter: "Ansou Fall",
    reported: "Dr. Marie Fall",
    date: "2024-02-17",
    status: "En attente",
    content: "Diffusion d'informations médicales potentiellement incorrectes concernant un traitement non validé scientifiquement, ce qui pourrait représenter un danger pour les patients.",
  },
];

const ModrationPage = () => {
  const [activeReports, setActiveReports] = useState(reports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
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
                className="w-full justify-start bg-gray-100"
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
                            className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600"
                            onClick={() => handleViewReport(report)}
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

      {/* Dialog pour afficher les détails du signalement */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Détails du signalement
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="font-medium">{selectedReport.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p>{selectedReport.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Signalé par</p>
                      <p>{selectedReport.reporter}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Utilisateur signalé</p>
                      <p>{selectedReport.reported}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                    <div className="p-4 bg-gray-50 rounded-md text-sm">
                      {selectedReport.content}
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Fermer
            </Button>
            {selectedReport && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    handleReject(selectedReport.id);
                    setOpenDialog(false);
                  }}
                >
                  Rejeter
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedReport.id);
                    setOpenDialog(false);
                  }}
                >
                  Résoudre
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModrationPage;
