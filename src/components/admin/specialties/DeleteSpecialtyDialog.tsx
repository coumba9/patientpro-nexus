
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Specialty } from "./SpecialtiesTable";

interface DeleteSpecialtyDialogProps {
  specialty: Specialty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (id: number) => void;
}

const DeleteSpecialtyDialog = ({ specialty, open, onOpenChange, onSuccess }: DeleteSpecialtyDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setIsDeleting(false);
      onSuccess(specialty.id);
    }, 1000);
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
        
        <div className="py-4">
          <p className="text-sm text-gray-500">
            {specialty.totalDoctors > 0 ? (
              <span className="font-medium text-amber-600">
                Attention : Cette spécialité est associée à {specialty.totalDoctors} médecin{specialty.totalDoctors > 1 ? "s" : ""}.
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
