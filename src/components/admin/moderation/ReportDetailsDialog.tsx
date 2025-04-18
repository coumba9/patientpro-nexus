
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Report {
  id: number;
  type: string;
  reporter: string;
  reported: string;
  date: string;
  status: string;
  content: string;
}

interface ReportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onReject: (id: number) => void;
  onApprove: (id: number) => void;
}

export const ReportDetailsDialog = ({
  open,
  onOpenChange,
  report,
  onReject,
  onApprove,
}: ReportDetailsDialogProps) => {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Détails du signalement
          </DialogTitle>
          <DialogDescription>
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="font-medium">{report.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{report.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Signalé par</p>
                  <p>{report.reporter}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Utilisateur signalé</p>
                  <p>{report.reported}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <div className="p-4 bg-gray-50 rounded-md text-sm">
                  {report.content}
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              onReject(report.id);
              onOpenChange(false);
            }}
          >
            Rejeter
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              onApprove(report.id);
              onOpenChange(false);
            }}
          >
            Résoudre
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
