import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Star, 
  Calendar, 
  Download, 
  CreditCard,
  MessageCircle
} from "lucide-react";
import { RatingDialog } from "@/components/appointment/RatingDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CompletedAppointmentActionsProps {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  hasRated: boolean;
  hasMedicalRecord: boolean;
  hasPrescription: boolean;
  paymentStatus: string;
  onMessageDoctor: () => void;
}

export const CompletedAppointmentActions = ({
  appointmentId,
  doctorId,
  doctorName,
  hasRated,
  hasMedicalRecord,
  hasPrescription,
  paymentStatus,
  onMessageDoctor
}: CompletedAppointmentActionsProps) => {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const navigate = useNavigate();

  const handleViewMedicalRecord = () => {
    navigate(`/patient/appointment/${appointmentId}`);
  };

  const handleViewPrescription = () => {
    navigate('/patient/prescriptions');
  };

  const handleDownloadInvoice = () => {
    // TODO: Implémenter le téléchargement de facture
    toast.success("Téléchargement de la facture...");
  };

  const handleBookNewAppointment = () => {
    navigate(`/book-appointment?doctorId=${doctorId}`);
  };

  const handlePayNow = () => {
    // TODO: Rediriger vers le paiement
    toast.info("Redirection vers le paiement...");
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Voir compte-rendu */}
        {hasMedicalRecord && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewMedicalRecord}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Compte-rendu
          </Button>
        )}

        {/* Voir ordonnance */}
        {hasPrescription && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPrescription}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Ordonnance
          </Button>
        )}

        {/* Évaluer le médecin */}
        {!hasRated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRatingDialog(true)}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Évaluer
          </Button>
        )}

        {/* Payer maintenant */}
        {paymentStatus === 'pending' && (
          <Button
            variant="default"
            size="sm"
            onClick={handlePayNow}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Payer
          </Button>
        )}

        {/* Télécharger facture */}
        {paymentStatus === 'paid' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Facture
          </Button>
        )}

        {/* Reprendre RDV */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBookNewAppointment}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Nouveau RDV
        </Button>

        {/* Contacter */}
        <Button
          variant="outline"
          size="sm"
          onClick={onMessageDoctor}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Contacter
        </Button>
      </div>

      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        appointmentId={appointmentId}
        doctorId={doctorId}
        doctorName={doctorName}
      />
    </>
  );
};
