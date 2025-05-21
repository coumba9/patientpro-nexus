
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Specialty } from "./SpecialtiesTable";
import { specialtyService } from "@/api";

interface DeleteSpecialtyDialogProps {
  specialty: Specialty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (id: string) => void;
}

const DeleteSpecialtyDialog = ({ specialty, open, onOpenChange, onSuccess }: DeleteSpecialtyDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await specialtyService.delete(specialty.id);
      onSuccess(specialty.id);
    } catch (error: any) {
      console.error('Error deleting specialty:', error);
      setError(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">Supprimer la spécialité</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la spécialité <strong>{specialty.name}</strong> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="py-4">
          <p className="text-sm text-gray-500">
            {specialty.total_doctors && specialty.total_doctors > 0 ? (
              <span className="font-medium text-amber-600">
                Attention : Cette spécialité est associée à {specialty.total_doctors} médecin{specialty.total_doctors > 1 ? "s" : ""}.
                La suppression peut affecter leur profil.
              </span>
            ) : (
              <span>
                Cette spécialité n'est associée à aucun médecin.
              </span>
            )}
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression en cours..." : "Confirmer la suppression"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSpecialtyDialog;
