
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ReportDetailsDialog } from "./ReportDetailsDialog";

interface Report {
  id: number;
  type: string;
  reporter: string;
  reported: string;
  date: string;
  status: string;
  content: string;
}

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

export const ReportsTab = () => {
  const [activeReports, setActiveReports] = useState(reports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
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

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  return (
    <>
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
                    className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 shadow-sm hover:shadow"
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

      <ReportDetailsDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        report={selectedReport}
        onReject={handleReject}
        onApprove={handleApprove}
      />
    </>
  );
};
