import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface PrescriptionViewerProps {
  prescription: Prescription;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const PrescriptionViewer = ({ 
  prescription, 
  isOpen, 
  onClose, 
  onDownload 
}: PrescriptionViewerProps) => {
  const handlePrint = () => {
    const printContent = document.getElementById('prescription-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Ordonnance ${prescription.date}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .prescription-header { border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px; }
              .doctor-info { margin-bottom: 20px; }
              .patient-info { margin-bottom: 20px; }
              .medications { margin: 20px 0; }
              .medication-item { margin: 10px 0; padding: 10px; border-left: 3px solid #3b82f6; background: #f8fafc; }
              .signature { margin-top: 40px; text-align: right; }
              .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ordonnance du {prescription.date}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div id="prescription-content" className="bg-white p-8 border rounded-lg">
          {/* En-tête de l'ordonnance */}
          <div className="prescription-header border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="doctor-info">
                <h2 className="text-xl font-bold text-gray-900">{prescription.doctor}</h2>
                <p className="text-gray-600">{prescription.doctorSpecialty || "Médecin généraliste"}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {prescription.doctorAddress || "Cabinet médical - Adresse du médecin"}
                </p>
                <p className="text-sm text-gray-500">Tél: +221 XX XXX XX XX</p>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-blue-600 mb-2">ORDONNANCE</h1>
                <p className="text-sm text-gray-500">Date: {prescription.date}</p>
                {prescription.signed && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    Ordonnance signée
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Informations du patient */}
          <div className="patient-info bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Informations du patient</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Nom:</span> {prescription.patientName || "Patient"}</p>
                <p><span className="font-medium">Âge:</span> {prescription.patientAge || "N/A"}</p>
              </div>
              <div>
                <p><span className="font-medium">Date de consultation:</span> {prescription.date}</p>
                {prescription.diagnosis && (
                  <p><span className="font-medium">Diagnostic:</span> {prescription.diagnosis}</p>
                )}
              </div>
            </div>
          </div>

          {/* Médicaments prescrits */}
          <div className="medications">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Prescription médicamenteuse</h3>
            <div className="space-y-4">
              {prescription.medications.map((med, idx) => (
                <div key={idx} className="medication-item border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900">{med.name}</h4>
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">Dosage:</span> {med.dosage}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Posologie:</span> {med.frequency}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Durée: {prescription.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Instructions importantes</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Respecter scrupuleusement la posologie indiquée</li>
              <li>• Terminer le traitement même en cas d'amélioration</li>
              <li>• En cas d'effets indésirables, contacter immédiatement votre médecin</li>
              <li>• Conserver les médicaments dans un endroit sec et à l'abri de la lumière</li>
            </ul>
          </div>

          {/* Signature */}
          {prescription.signed && (
            <div className="signature mt-8">
              <div className="text-right">
                <p className="text-gray-700 mb-4">Fait le {prescription.date}</p>
                <div className="border-t border-gray-300 pt-4 w-64 ml-auto">
                  <p className="font-semibold">{prescription.doctor}</p>
                  <p className="text-sm text-gray-600">Signature et cachet</p>
                </div>
              </div>
            </div>
          )}

          {/* Pied de page */}
          <div className="footer mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Cette ordonnance est valide pour une durée déterminée. 
              Consultez votre pharmacien pour plus d'informations.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};