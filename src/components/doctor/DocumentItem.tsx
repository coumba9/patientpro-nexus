
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { File, FileSignature, Download, Share2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DocItem } from "./types";

interface DocumentItemProps {
  doc: DocItem;
  onSignDocument: (doc: DocItem) => void;
  onDownload: (doc: DocItem) => void;
  onShare: (doc: DocItem) => void;
}

export const DocumentItem = ({ doc, onSignDocument, onDownload, onShare }: DocumentItemProps) => {
  return (
    <div
      key={doc.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-start gap-4">
        <File className="h-8 w-8 text-primary" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{doc.name}</h3>
            {doc.signed && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <FileSignature className="h-3 w-3 mr-1" />
                Signé
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{doc.date}</span>
            <span>{doc.type}</span>
            <span>{doc.size}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Patient: {doc.patient}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {/* View document content button - for all document types */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Visualiser
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Contenu du document</DialogTitle>
            </DialogHeader>
            <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-line">
              <h3 className="font-semibold mb-2">{doc.name}</h3>
              {doc.content ? (
                <p className="text-sm text-gray-700">{doc.content}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Contenu non disponible pour ce document</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {doc.type === "Ordonnance" && !doc.signed && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileSignature className="h-4 w-4 mr-2" />
                Signer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Aperçu et signature du document</DialogTitle>
              </DialogHeader>
              <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-line">
                <h3 className="font-semibold mb-2">{doc.name}</h3>
                <p className="text-sm text-gray-700">{doc.content}</p>
              </div>
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={() => onSignDocument(doc)}
              >
                <FileSignature className="h-4 w-4 mr-2" />
                Signer cette ordonnance
              </Button>
            </DialogContent>
          </Dialog>
        )}
        <Button variant="outline" size="sm" onClick={() => onDownload(doc)}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
        <Button variant="outline" size="sm" onClick={() => onShare(doc)}>
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </div>
    </div>
  );
};
