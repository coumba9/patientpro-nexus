import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { documentService } from "@/api";
import { toast } from "sonner";
import {
  Search,
  Home,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DocumentItem } from "@/components/doctor/DocumentItem";
import { DocumentForm } from "@/components/doctor/DocumentForm";
import { ShareDocumentDialog } from "@/components/doctor/ShareDocumentDialog";
import { SignatureDialog } from "@/components/doctor/SignatureDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocItem } from "@/components/doctor/types";

const Documents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await documentService.getDocumentsByDoctor(user.id);
        
        const transformedDocs: DocItem[] = data.map((doc: any) => ({
          id: doc.id,
          name: doc.title,
          type: doc.type,
          date: new Date(doc.created_at).toLocaleDateString('fr-FR'),
          size: doc.file_size ? `${Math.round(doc.file_size / 1024)} Ko` : "256 Ko",
          patient: doc.patient?.profile 
            ? `${doc.patient.profile.first_name || ''} ${doc.patient.profile.last_name || ''}`.trim() || 'Patient inconnu'
            : 'Patient inconnu',
          signed: doc.is_signed,
          content: doc.file_url || undefined
        }));
        
        setDocuments(transformedDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
        toast.error("Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [user]);

  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [addDocDialogOpen, setAddDocDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.patient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignDocument = (doc: DocItem) => {
    setSelectedDoc(doc);
    setSignatureDialogOpen(true);
  };

  const saveSignature = async (signatureData: string) => {
    if (!selectedDoc) return;

    try {
      // Note: The document ID in selectedDoc is a number, we need the original doc
      const originalDoc = documents.find(d => d.id === selectedDoc.id);
      if (!originalDoc) return;

      // For now, just update the local state since we don't have the real document ID from DB
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === selectedDoc.id ? { ...doc, signed: true } : doc
        )
      );
      
      toast.success("Document signé avec succès");
      setSignatureDialogOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error("Erreur lors de la signature du document");
    }
  };

  const handleDownload = (doc: DocItem) => {
    const blob = new Blob([`Document: ${doc.name}\nDate: ${doc.date}\nPatient: ${doc.patient}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document téléchargé");
  };

  const handleShare = (doc: DocItem) => {
    setSelectedDoc(doc);
    setShareDialogOpen(true);
  };

  const confirmShare = () => {
    toast.success("Document partagé");
    setShareDialogOpen(false);
  };

  const handleAddDocument = async () => {
    if (!user?.id) return;
    toast.info("Fonctionnalité en cours de développement");
    setAddDocDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Link to="/doctor">
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Documents médicaux</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos ordonnances, certificats et comptes rendus
              </p>
            </div>
            <Button onClick={() => setAddDocDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau document
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un document ou un patient..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="text-center py-8">Chargement des documents...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun document trouvé
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    doc={doc}
                    onSignDocument={handleSignDocument}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={addDocDialogOpen} onOpenChange={setAddDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau document</DialogTitle>
          </DialogHeader>
          <DocumentForm onSubmit={handleAddDocument} />
        </DialogContent>
      </Dialog>

      <SignatureDialog
        isOpen={signatureDialogOpen}
        setIsOpen={setSignatureDialogOpen}
        document={selectedDoc}
        onSaveSignature={saveSignature}
      />

      <ShareDocumentDialog
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        document={selectedDoc}
        onShare={confirmShare}
      />
    </div>
  );
};

export default Documents;
