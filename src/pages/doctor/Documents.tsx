
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
  Filter,
  ArrowLeft,
  Home,
  Plus,
  Search,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { DocumentItem } from "@/components/doctor/DocumentItem";
import { DocumentForm } from "@/components/doctor/DocumentForm";
import { ShareDocumentDialog } from "@/components/doctor/ShareDocumentDialog";
import { SignatureDialog } from "@/components/doctor/SignatureDialog";
import { DocItem, DocFormValues } from "@/components/doctor/types";

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocItem[]>([
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocItem | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignDocument = (doc: DocItem) => {
    setSelectedDocument(doc);
    setSignatureDialogOpen(true);
  };

  const saveSignature = (signatureData: string) => {
    if (!selectedDocument) return;
    
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, signed: true } 
          : doc
      )
    );
    
    setSignatureDialogOpen(false);
    setSelectedDocument(null);
    toast.success("Document signé avec succès");
  };

  const handleDownload = (doc: DocItem) => {
    console.log("Téléchargement du document:", doc.name);
    
    const blob = new Blob([doc.content || "Contenu du document"], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = doc.name + '.txt';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    
    toast.success(`${doc.name} téléchargé`);
  };

  const handleShare = (doc: DocItem) => {
    setSelectedDocument(doc);
    setShareDialogOpen(true);
  };

  const confirmShare = () => {
    if (!selectedDocument) return;
    setShareDialogOpen(false);
    toast.success(`${selectedDocument.name} partagé`);
    setSelectedDocument(null);
  };

  const handleAddDocument = (values: DocFormValues) => {
    if (!values.name || !values.patient || !values.content) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    const newDoc: DocItem = {
      id: documents.length + 1,
      name: values.name,
      type: values.type,
      date: formattedDate,
      size: Math.floor(values.content.length / 10) + " KB",
      patient: values.patient,
      signed: false,
      content: values.content
    };

    setDocuments([...documents, newDoc]);
    setAddDocumentOpen(false);
    toast.success("Document ajouté avec succès");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            </Link>
          </div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Gérez vos ordonnances et documents médicaux</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Dialog open={addDocumentOpen} onOpenChange={setAddDocumentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau document</DialogTitle>
              </DialogHeader>
              <DocumentForm onSubmit={handleAddDocument} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <DocumentItem 
                  key={doc.id}
                  doc={doc}
                  onSignDocument={handleSignDocument}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun document ne correspond à votre recherche
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <SignatureDialog 
        isOpen={signatureDialogOpen}
        setIsOpen={setSignatureDialogOpen}
        document={selectedDocument}
        onSaveSignature={saveSignature}
      />

      <ShareDocumentDialog
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        document={selectedDocument}
        onShare={confirmShare}
      />
    </Card>
  );
};

export default Documents;
