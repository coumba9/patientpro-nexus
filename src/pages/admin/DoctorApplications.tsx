import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Eye, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useAuth } from "@/hooks/useAuth";

interface DoctorApplication {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  specialty_id: string | null;
  license_number: string;
  years_of_experience: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  diploma_url: string | null;
  license_url: string | null;
  other_documents_urls: string[] | null;
}

const DoctorApplications = () => {
  const { user } = useAuth();
  const { newApplicationsCount } = useAdminNotifications(user?.id || null);
  const [selectedApplication, setSelectedApplication] = useState<DoctorApplication | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['doctor-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DoctorApplication[];
    }
  });

  // Fetch specialties for display
  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('id, name');

      if (error) throw error;
      return data as { id: string; name: string }[];
    }
  });

  const getSpecialtyName = (specialtyId: string | null) => {
    if (!specialtyId || !specialties) return 'Non spécifié';
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty?.name || 'Non spécifié';
  };

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ applicationId, password }: { applicationId: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke('approve-doctor-application', {
        body: { applicationId, password }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-applications'] });
      setShowApproveDialog(false);
      setSelectedApplication(null);
      setTemporaryPassword("");
      toast.success("Demande approuvée et email envoyé avec succès");
    },
    onError: (error: any) => {
      console.error('Approve error:', error);
      toast.error("Erreur lors de l'approbation: " + error.message);
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason: string }) => {
      const { data, error } = await supabase.functions.invoke('reject-doctor-application', {
        body: { applicationId, reason }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-applications'] });
      setShowRejectDialog(false);
      setSelectedApplication(null);
      setRejectionReason("");
      toast.success("Demande rejetée et email envoyé avec succès");
    },
    onError: (error: any) => {
      console.error('Reject error:', error);
      toast.error("Erreur lors du rejet: " + error.message);
    }
  });

  const handleApprove = () => {
    if (!selectedApplication) return;
    if (!temporaryPassword || temporaryPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    approveMutation.mutate({
      applicationId: selectedApplication.id,
      password: temporaryPassword
    });
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    if (!rejectionReason.trim()) {
      toast.error("Veuillez fournir un motif de rejet");
      return;
    }

    rejectMutation.mutate({
      applicationId: selectedApplication.id,
      reason: rejectionReason
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>;
      default:
        return null;
    }
  };

  const downloadDocument = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('doctor-documents')
        .download(path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Document téléchargé avec succès");
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error("Erreur lors du téléchargement du document");
    }
  };

  const pendingCount = applications?.filter(app => app.status === 'pending').length || 0;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block w-64 border-r">
        <AdminSidebar />
      </div>
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Demandes d'inscription des médecins</h1>
          <p className="text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente` : 'Aucune demande en attente'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        Dr {application.first_name} {application.last_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{application.email}</p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Spécialité</p>
                      <p className="text-sm">{getSpecialtyName(application.specialty_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Numéro de licence</p>
                      <p className="text-sm">{application.license_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expérience</p>
                      <p className="text-sm">{application.years_of_experience} ans</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de demande</p>
                      <p className="text-sm">
                        {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* Documents section */}
                  {(application.diploma_url || application.license_url || (application.other_documents_urls && application.other_documents_urls.length > 0)) && (
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Documents justificatifs</p>
                      <div className="space-y-2">
                        {application.diploma_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDocument(application.diploma_url!, 'diplome.pdf')}
                            className="w-full justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Diplôme médical
                            <Download className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                        {application.license_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDocument(application.license_url!, 'licence.pdf')}
                            className="w-full justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Licence d'exercice
                            <Download className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                        {application.other_documents_urls && application.other_documents_urls.map((url, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDocument(url, `document-${index + 1}.pdf`)}
                            className="w-full justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Document additionnel {index + 1}
                            <Download className="w-4 h-4 ml-auto" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <p className="text-sm font-medium text-red-800 mb-1">Motif du rejet :</p>
                      <p className="text-sm text-red-700">{application.rejection_reason}</p>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApproveDialog(true);
                        }}
                        className="flex-1"
                        variant="default"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowRejectDialog(true);
                        }}
                        className="flex-1"
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Eye className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">Aucune demande pour le moment</p>
              <p className="text-muted-foreground">Les demandes d'inscription apparaîtront ici</p>
            </CardContent>
          </Card>
        )}

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approuver la demande</DialogTitle>
              <DialogDescription>
                Créez un mot de passe temporaire pour Dr {selectedApplication?.first_name} {selectedApplication?.last_name}. 
                Ce mot de passe sera envoyé par email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="password">Mot de passe temporaire</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Au moins 8 caractères"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le médecin devra changer ce mot de passe lors de sa première connexion
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Traitement..." : "Approuver et envoyer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter la demande</DialogTitle>
              <DialogDescription>
                Expliquez pourquoi la demande de Dr {selectedApplication?.first_name} {selectedApplication?.last_name} est rejetée. 
                Cette raison sera envoyée par email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="reason">Motif du rejet</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez en détail la raison du rejet..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Traitement..." : "Rejeter et envoyer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DoctorApplications;
