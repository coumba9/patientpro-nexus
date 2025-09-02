import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSignature, Share2, Eye, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PrescriptionViewer } from "./PrescriptionViewer";
import { toast } from "sonner";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface Prescription {
  id: string;
  date: string;
  doctor: string;
  medications: Medication[];
  duration: string;
  signed: boolean;
  patientName?: string;
  patientAge?: string;
  diagnosis?: string;
  doctorSpecialty?: string;
  doctorAddress?: string;
}

interface PrescriptionCardProps {
  prescription: Prescription;
  onDownload: (id: string) => void;
  onSign?: (id: string) => void;
}

export const PrescriptionCard = ({ prescription, onDownload, onSign }: PrescriptionCardProps) => {
  const [showViewer, setShowViewer] = useState(false);

  const handlePrint = () => {
    const printContent = document.getElementById('prescription-content');
    if (printContent) {
      window.print();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ordonnance du {prescription.date}</h3>
              <p className="text-sm text-muted-foreground">Patient: {prescription.patientName}</p>
              <div className="flex items-center gap-2">
                {prescription.signed ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    <FileSignature className="h-3 w-3 mr-1" />
                    Signée
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                    En attente de signature
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowViewer(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownload(prescription.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              {!prescription.signed && onSign && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onSign(prescription.id)}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Signer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prescription.diagnosis && (
              <div>
                <p className="text-sm text-muted-foreground">Diagnostic</p>
                <p className="font-medium">{prescription.diagnosis}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Médicaments prescrits :</h4>
              <ul className="space-y-2">
                {prescription.medications.map((med, idx) => (
                  <li key={idx} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-500">
                    <div className="font-semibold text-blue-900 dark:text-blue-100">{med.name}</div>
                    <div className="text-blue-700 dark:text-blue-300">{med.dosage} - {med.frequency}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Durée du traitement :</span> {prescription.duration}
            </div>
          </div>
        </CardContent>
      </Card>

      <PrescriptionViewer
        prescription={prescription}
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        onDownload={() => onDownload(prescription.id)}
      />
    </>
  );
};