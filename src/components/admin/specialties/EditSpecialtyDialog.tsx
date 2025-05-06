
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Specialty } from "./SpecialtiesTable";
import { supabase } from "@/integrations/supabase/client";

interface EditSpecialtyDialogProps {
  specialty: Specialty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedSpecialty: Specialty) => void;
}

const EditSpecialtyDialog = ({ specialty, open, onOpenChange, onSuccess }: EditSpecialtyDialogProps) => {
  const [formData, setFormData] = useState({
    id: specialty.id,
    name: specialty.name,
    description: specialty.description || "",
    status: specialty.status,
    total_doctors: specialty.total_doctors || 0,
    created_at: specialty.created_at
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (specialty) {
      setFormData({
        id: specialty.id,
        name: specialty.name,
        description: specialty.description || "",
        status: specialty.status,
        total_doctors: specialty.total_doctors || 0,
        created_at: specialty.created_at
      });
    }
  }, [specialty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "active" | "inactive",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from('specialties')
        .update({ 
          name: formData.name, 
          description: formData.description,
          status: formData.status
        })
        .eq('id', specialty.id)
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        onSuccess(data[0] as Specialty);
      }
    } catch (error: any) {
      console.error('Error updating specialty:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la spécialité</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de cette spécialité médicale.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la spécialité</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour en cours..." : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSpecialtyDialog;
