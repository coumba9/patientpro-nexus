import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSignature, Share2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PrescriptionViewer } from "./PrescriptionViewer";
import { SharePrescriptionDialog } from "./SharePrescriptionDialog";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface Prescription {
  id: number;
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
  onDownload: (id: number) => void;
}

export const PrescriptionCard = ({ prescription, onDownload }: PrescriptionCardProps) => {
  const [showViewer, setShowViewer] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ordonnance du {prescription.date}</h3>
              <div className="flex items-center gap-2">
                {prescription.signed ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <FileSignature className="h-3 w-3 mr-1" />
                    Signée par {prescription.doctor}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
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
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">{prescription.doctor}</p>
              <p className="text-sm text-gray-500">{prescription.doctorSpecialty || "Médecin généraliste"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Médicaments prescrits :</h4>
              <ul className="space-y-1">
                {prescription.medications.map((med, idx) => (
                  <li key={idx} className="text-sm text-gray-600 pl-2 border-l-2 border-blue-100">
                    <span className="font-medium">{med.name}</span> - {med.dosage} - {med.frequency}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-gray-500">
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

      <SharePrescriptionDialog
        prescription={prescription}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </>
  );
};