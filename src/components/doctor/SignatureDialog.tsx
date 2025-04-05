
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignaturePad } from "@/components/doctor/SignaturePad";

interface DocItem {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  patient: string;
  signed: boolean;
  content?: string;
}

interface SignatureDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  document: DocItem | null;
  onSaveSignature: (signatureData: string) => void;
}

export const SignatureDialog = ({
  isOpen,
  setIsOpen,
  document,
  onSaveSignature
}: SignatureDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Signer le document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            En tant que médecin, votre signature valide médicalement ce document pour le patient "{document?.patient}".
          </p>
          <SignaturePad 
            onSave={onSaveSignature} 
            onCancel={() => setIsOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
