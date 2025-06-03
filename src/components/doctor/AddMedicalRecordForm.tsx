
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { medicalRecordService } from "@/api";
import { Plus, Stethoscope } from "lucide-react";

interface AddMedicalRecordFormProps {
  patientId: string;
  doctorId: string;
  onRecordAdded: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const AddMedicalRecordForm = ({
  patientId,
  doctorId,
  onRecordAdded,
  isVisible,
  onToggleVisibility,
}: AddMedicalRecordFormProps) => {
  const [formData, setFormData] = useState({
    diagnosis: "",
    prescription: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.diagnosis.trim()) {
      toast.error("Le diagnostic est obligatoire");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await medicalRecordService.addMedicalRecord({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis: formData.diagnosis.trim(),
        prescription: formData.prescription.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        date: new Date().toISOString().split('T')[0],
      });

      toast.success("Dossier médical ajouté avec succès");
      
      // Reset form
      setFormData({
        diagnosis: "",
        prescription: "",
        notes: "",
      });
      
      onRecordAdded();
      onToggleVisibility();
    } catch (error) {
      console.error("Error adding medical record:", error);
      toast.error("Erreur lors de l'ajout du dossier médical");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="mb-4">
        <Button 
          onClick={onToggleVisibility}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un nouveau diagnostic
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Nouveau diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="diagnosis">Diagnostic *</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Saisissez le diagnostic..."
              required
            />
          </div>

          <div>
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              value={formData.prescription}
              onChange={(e) => setFormData(prev => ({ ...prev, prescription: e.target.value }))}
              placeholder="Médicaments prescrits, posologie..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observations, recommandations..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Ajout en cours..." : "Ajouter le diagnostic"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onToggleVisibility}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
