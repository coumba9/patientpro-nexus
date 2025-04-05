
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

interface DocFormValues {
  name: string;
  type: string;
  patient: string;
  content: string;
}

interface DocumentFormProps {
  initialValues?: DocFormValues;
  onSubmit: (values: DocFormValues) => void;
}

export const DocumentForm = ({ 
  initialValues = { name: "", type: "Ordonnance", patient: "", content: "" },
  onSubmit 
}: DocumentFormProps) => {
  const [values, setValues] = useState<DocFormValues>(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setValues({ ...values, [id]: value });
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du document</Label>
        <Input 
          id="name" 
          value={values.name} 
          onChange={handleChange} 
          placeholder="Ex: Ordonnance - Nom du patient"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type de document</Label>
        <select 
          id="type" 
          className="w-full p-2 border rounded-md"
          value={values.type}
          onChange={handleChange}
        >
          <option value="Ordonnance">Ordonnance</option>
          <option value="Compte-rendu">Compte-rendu</option>
          <option value="Certificat">Certificat médical</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="patient">Nom du patient</Label>
        <Input 
          id="patient" 
          value={values.patient} 
          onChange={handleChange} 
          placeholder="Nom du patient"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Contenu</Label>
        <Textarea 
          id="content" 
          value={values.content} 
          onChange={handleChange} 
          placeholder="Contenu du document"
          rows={5}
        />
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Ajouter le document</Button>
      </DialogFooter>
    </div>
  );
};
