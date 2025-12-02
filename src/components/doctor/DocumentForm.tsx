import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealPatients } from "@/hooks/useRealPatients";
import { useAuth } from "@/hooks/useAuth";

interface DocFormValues {
  name: string;
  type: string;
  patient: string;
  patientId: string;
  content: string;
}

export type { DocFormValues };

interface DocumentFormProps {
  initialValues?: Partial<DocFormValues>;
  onSubmit: (values: DocFormValues) => void;
}

export const DocumentForm = ({ 
  initialValues = { name: "", type: "Ordonnance", patient: "", patientId: "", content: "" },
  onSubmit 
}: DocumentFormProps) => {
  const { user } = useAuth();
  const { patients, loading: patientsLoading } = useRealPatients(user?.id || null);
  const [values, setValues] = useState<DocFormValues>({
    name: initialValues.name || "",
    type: initialValues.type || "Ordonnance",
    patient: initialValues.patient || "",
    patientId: initialValues.patientId || "",
    content: initialValues.content || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setValues({ ...values, [id]: value });
  };

  const handleTypeChange = (value: string) => {
    setValues({ ...values, type: value });
  };

  const handlePatientChange = (patientId: string) => {
    const selectedPatient = patients.find(p => p.id === patientId);
    setValues({ 
      ...values, 
      patientId,
      patient: selectedPatient?.name || ""
    });
  };

  const handleSubmit = () => {
    if (!values.name || !values.patientId || !values.content) {
      return;
    }
    onSubmit(values);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="patient">Patient</Label>
        {patientsLoading ? (
          <div className="text-sm text-muted-foreground">Chargement des patients...</div>
        ) : patients.length > 0 ? (
          <Select value={values.patientId} onValueChange={handlePatientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(patient => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            id="patient" 
            value={values.patient} 
            onChange={handleChange} 
            placeholder="Nom du patient"
          />
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Type de document</Label>
        <Select value={values.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Type de document" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ordonnance">Ordonnance</SelectItem>
            <SelectItem value="Compte-rendu">Compte-rendu</SelectItem>
            <SelectItem value="Certificat">Certificat médical</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Titre du document</Label>
        <Input 
          id="name" 
          value={values.name} 
          onChange={handleChange} 
          placeholder="Ex: Ordonnance - Traitement grippe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu</Label>
        <Textarea 
          id="content" 
          value={values.content} 
          onChange={handleChange} 
          placeholder={values.type === "Ordonnance" 
            ? "Paracétamol 1g - 3 fois par jour pendant 5 jours\nIbuprofène 400mg - 2 fois par jour si douleur"
            : "Contenu du document"
          }
          rows={6}
        />
      </div>

      <DialogFooter>
        <Button 
          onClick={handleSubmit}
          disabled={!values.name || !values.patientId || !values.content}
        >
          Créer le document
        </Button>
      </DialogFooter>
    </div>
  );
};
