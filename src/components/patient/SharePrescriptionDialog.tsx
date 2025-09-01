import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface SharePrescriptionDialogProps {
  prescription: Prescription;
  isOpen: boolean;
  onClose: () => void;
}

export const SharePrescriptionDialog = ({ 
  prescription, 
  isOpen, 
  onClose 
}: SharePrescriptionDialogProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    setIsLoading(true);
    
    try {
      // Appeler la fonction Edge pour envoyer l'email
      const { data, error } = await supabase.functions.invoke('share-prescription', {
        body: {
          email,
          message,
          prescription: {
            ...prescription,
            patientName: prescription.patientName || "Patient",
            patientAge: prescription.patientAge || "N/A",
            doctorSpecialty: prescription.doctorSpecialty || "Médecin généraliste",
            doctorAddress: prescription.doctorAddress || "Cabinet médical"
          }
        }
      });

      if (error) {
        console.error('Error sharing prescription:', error);
        toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
        return;
      }

      toast.success(`Ordonnance envoyée avec succès à ${email}`);
      setEmail("");
      setMessage("");
      onClose();
    } catch (error) {
      console.error('Error sharing prescription:', error);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager l'ordonnance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-email">Adresse email du destinataire *</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-message">Message (optionnel)</Label>
            <Textarea
              id="share-message"
              placeholder="Bonjour, je vous envoie mon ordonnance en pièce jointe..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
            <p><strong>Ordonnance à partager :</strong></p>
            <p>Date : {prescription.date}</p>
            <p>Médecin : {prescription.doctor}</p>
            <p>Médicaments : {prescription.medications.length} prescription(s)</p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleShare}
            disabled={isLoading || !email}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};