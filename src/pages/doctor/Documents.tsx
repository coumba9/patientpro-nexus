
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Download,
  Search,
  File,
  Filter,
  FileSignature,
  Share2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignaturePad } from "@/components/doctor/SignaturePad";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  patient: string;
  signed: boolean;
  content?: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Ordonnance - Marie Dubois",
      type: "Ordonnance",
      date: "2024-02-20",
      size: "245 KB",
      patient: "Marie Dubois",
      signed: false,
      content: "Paracétamol 1000mg - 3x par jour pendant 5 jours\nIbuprofène 400mg - 2x par jour pendant 3 jours"
    },
    {
      id: 2,
      name: "Compte-rendu consultation",
      type: "Compte-rendu",
      date: "2024-02-19",
      size: "180 KB",
      patient: "Jean Martin",
      signed: true
    },
    {
      id: 3,
      name: "Ordonnance - Sophie Lambert",
      type: "Ordonnance",
      date: "2024-02-22",
      size: "198 KB",
      patient: "Sophie Lambert",
      signed: false,
      content: "Amoxicilline 500mg - 2x par jour pendant 7 jours"
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);

  const handleSignDocument = (document: Document) => {
    setSelectedDocument(document);
    setSignatureDialogOpen(true);
  };

  const saveSignature = (signatureData: string) => {
    if (!selectedDocument) return;
    
    // Mise à jour du document avec la signature
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, signed: true } 
          : doc
      )
    );
    
    // Dans une application réelle, nous sauvegarderions aussi l'image de la signature
    setSignatureDialogOpen(false);
    setSelectedDocument(null);
    toast.success("Document signé avec succès");
  };

  const handleDownload = (document: Document) => {
    // Dans une application réelle, cela déclencherait un téléchargement du document
    toast.success(`${document.name} téléchargé`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Gérez vos ordonnances et documents médicaux</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher un document..."
          />
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {documents.map((doc) => (
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
                  {doc.type === "Ordonnance" && !doc.signed && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
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
                          onClick={() => handleSignDocument(doc)}
                        >
                          <FileSignature className="h-4 w-4 mr-2" />
                          Signer cette ordonnance
                        </Button>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Modal de signature */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Signer le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Veuillez signer ci-dessous pour valider le document "{selectedDocument?.name}".
            </p>
            <SignaturePad 
              onSave={saveSignature} 
              onCancel={() => setSignatureDialogOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Documents;
