
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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

interface ShareDocumentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  document: DocItem | null;
  onShare: () => void;
}

export const ShareDocumentDialog = ({ 
  isOpen, 
  setIsOpen, 
  document, 
  onShare 
}: ShareDocumentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Partager le document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>Partager <strong>{document?.name}</strong> avec :</p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Adresse email du destinataire" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea id="message" placeholder="Message à inclure avec le document" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onShare}>Envoyer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
