import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, XCircle, Clock, Calendar, AlertCircle, User, FileText, Heart, Pill, AlertTriangle, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { appointmentService } from "@/api/services/appointment.service";
import { smsService } from "@/api/services/sms.service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog";
import { ValidateRescheduleDialog } from "./ValidateRescheduleDialog";

// Helper to parse medical info from notes
const parseMedicalInfo = (notes: string | null) => {
  if (!notes) return null;
  try {
    return JSON.parse(notes);
  } catch {
    return { consultationReason: notes };
  }
};

// Appointment type translation
const getAppointmentTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    consultation: "Consultation",
    followup: "Suivi",
    emergency: "Urgence",
    checkup: "Bilan de santé"
  };
  return types[type] || type;
};

interface AppointmentDetailCardProps {
  appointment: any;
  medicalInfo: any;
  isPendingReschedule: boolean;
  onConfirm: (id: string) => void;
  onCancel: (apt: any) => void;
  onReschedule: (apt: any) => void;
  onValidateReschedule: (apt: any) => void;
  doctorId: string;
}

const AppointmentDetailCard = ({
  appointment,
  medicalInfo,
  isPendingReschedule,
  onConfirm,
  onCancel,
  onReschedule,
  onValidateReschedule,
  doctorId
}: AppointmentDetailCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const patientName = `${appointment.patient?.profile?.first_name || ''} ${appointment.patient?.profile?.last_name || ''}`.trim() || 'Patient';

  return (
    <div className="space-y-2">
      {isPendingReschedule && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Le patient a demandé à reporter ce rendez-vous
            </p>
            <Button
              variant="link"
              className="h-auto p-0 text-sm text-primary"
              onClick={() => onValidateReschedule(appointment)}
            >
              Valider ou refuser le report →
            </Button>
          </div>
        </div>
      )}
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg overflow-hidden">
          {/* Header - Always visible */}
          <div className="p-4 bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{patientName}</span>
                  <Badge 
                    variant={
                      appointment.status === 'confirmed' ? 'default' :
                      appointment.status === 'pending' ? 'secondary' :
                      appointment.status === 'awaiting_patient_confirmation' ? 'secondary' :
                      appointment.status === 'pending_reschedule' ? 'secondary' :
                      appointment.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }
                  >
                    {appointment.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {appointment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {appointment.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                    {appointment.status === 'confirmed' ? 'Confirmé' :
                     appointment.status === 'pending' ? 'À valider' :
                     appointment.status === 'awaiting_patient_confirmation' ? 'En attente patient' :
                     appointment.status === 'pending_reschedule' ? 'Report en attente' :
                     appointment.status === 'cancelled' ? 'Annulé' :
                     appointment.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {getAppointmentTypeLabel(appointment.type)}
                  </span>
                  <Badge variant="outline">
                    {appointment.mode === 'teleconsultation' ? (
                      <><Video className="h-3 w-3 mr-1" /> Téléconsultation</>
                    ) : (
                      'Présentiel'
                    )}
                  </Badge>
                </div>

                {/* Quick preview of consultation reason */}
                {medicalInfo?.consultationReason && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <span className="font-medium text-blue-800">Motif: </span>
                    <span className="text-blue-700">{medicalInfo.consultationReason}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  {appointment.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onConfirm(appointment.id)}
                      title="Confirmer"
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReschedule(appointment)}
                    title="Reporter"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel(appointment)}
                    title="Annuler"
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/doctor/patients/${encodeURIComponent(patientName)}`)}
                    title="Voir dossier patient"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full">
                    {isOpen ? (
                      <><ChevronUp className="h-4 w-4 mr-1" /> Masquer détails</>
                    ) : (
                      <><ChevronDown className="h-4 w-4 mr-1" /> Voir détails</>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>

          {/* Collapsible content with medical details */}
          <CollapsibleContent>
            <div className="border-t p-4 bg-muted/30 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Informations médicales du patient</h4>
              
              {medicalInfo ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {medicalInfo.consultationReason && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        Motif de consultation
                      </div>
                      <p className="text-sm">{medicalInfo.consultationReason}</p>
                    </div>
                  )}
                  
                  {medicalInfo.currentSymptoms && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        Symptômes actuels
                      </div>
                      <p className="text-sm">{medicalInfo.currentSymptoms}</p>
                    </div>
                  )}
                  
                  {medicalInfo.knownAllergies && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Allergies connues
                      </div>
                      <p className="text-sm">{medicalInfo.knownAllergies}</p>
                    </div>
                  )}
                  
                  {medicalInfo.currentMedications && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Pill className="h-4 w-4 text-blue-500" />
                        Médicaments actuels
                      </div>
                      <p className="text-sm">{medicalInfo.currentMedications}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aucune information médicale fournie par le patient lors de la prise de rendez-vous.
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/doctor/patients/${encodeURIComponent(patientName)}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Accéder au dossier complet
                </Button>
                {appointment.mode === 'teleconsultation' && appointment.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/doctor/teleconsultation', { 
                      state: { 
                        patient: patientName,
                        reason: medicalInfo?.consultationReason || '',
                        time: appointment.time,
                        date: appointment.date
                      } 
                    })}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Démarrer téléconsultation
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

interface RealtimeAppointmentsListProps {
  doctorId: string;
}

export const RealtimeAppointmentsList = ({
  doctorId,
}: RealtimeAppointmentsListProps) => {
  const { appointments, loading } = useRealtimeAppointments(doctorId, 'doctor');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [validateRescheduleDialogOpen, setValidateRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleConfirm = async (appointmentId: string) => {
    try {
      await appointmentService.confirmAppointment(appointmentId, doctorId);
      toast.success("Rendez-vous validé. En attente de confirmation du patient.");
      
      const appointment = appointments.find(apt => apt.id === appointmentId);
      
      if (appointment) {
        try {
          const { data: patientData } = await supabase
            .from('patients')
            .select('phone_number')
            .eq('id', appointment.patient_id)
            .single();

          const { data: doctorProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', doctorId)
            .single();

          if (doctorProfile) {
            const doctorName = `${doctorProfile.first_name} ${doctorProfile.last_name}`;
            
            await smsService.sendAppointmentConfirmation(
              appointment.patient_id,
              patientData?.phone_number || '',
              appointment.date,
              appointment.time,
              doctorName
            );
          }
        } catch (smsError) {
          console.error('Erreur lors de l\'envoi du SMS (non bloquant):', smsError);
        }
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error("Erreur lors de la validation du rendez-vous");
    }
  };

  const openCancelDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const openRescheduleDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    setSelectedAppointment(null);
  };

  const handleRescheduleSuccess = () => {
    setSelectedAppointment(null);
  };

  const handleValidateReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setValidateRescheduleDialogOpen(true);
  };

  const handleValidateSuccess = () => {
    setSelectedAppointment(null);
    setValidateRescheduleDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'cancelled';
  }).sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rendez-vous à venir ({upcomingAppointments.length})</CardTitle>
        <Link to="/doctor/teleconsultation">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Espace téléconsultation
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucun rendez-vous à venir
              </div>
            ) : (
              upcomingAppointments.map((appointment: any) => {
                const isPendingReschedule = appointment.status === 'pending_reschedule';
                const medicalInfo = parseMedicalInfo(appointment.notes);
                
                return (
                  <AppointmentDetailCard
                    key={appointment.id}
                    appointment={appointment}
                    medicalInfo={medicalInfo}
                    isPendingReschedule={isPendingReschedule}
                    onConfirm={handleConfirm}
                    onCancel={openCancelDialog}
                    onReschedule={openRescheduleDialog}
                    onValidateReschedule={handleValidateReschedule}
                    doctorId={doctorId}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {selectedAppointment && (
        <>
          <CancelAppointmentDialog
            isOpen={cancelDialogOpen}
            onClose={() => setCancelDialogOpen(false)}
            appointmentId={selectedAppointment.id}
            patientName={`${selectedAppointment.patient?.profile?.first_name} ${selectedAppointment.patient?.profile?.last_name}`}
            appointmentTime={selectedAppointment.time}
            appointmentDate={new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}
            onCancel={handleCancelSuccess}
          />

          <RescheduleAppointmentDialog
            isOpen={rescheduleDialogOpen}
            onClose={() => setRescheduleDialogOpen(false)}
            appointmentId={selectedAppointment.id}
            patientName={`${selectedAppointment.patient?.profile?.first_name} ${selectedAppointment.patient?.profile?.last_name}`}
            currentDate={new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}
            currentTime={selectedAppointment.time}
            doctorId={doctorId}
            onReschedule={handleRescheduleSuccess}
          />

          <ValidateRescheduleDialog
            isOpen={validateRescheduleDialogOpen}
            onClose={() => setValidateRescheduleDialogOpen(false)}
            appointmentId={selectedAppointment.id}
            patientName={`${selectedAppointment.patient?.profile?.first_name} ${selectedAppointment.patient?.profile?.last_name}`}
            oldDate={selectedAppointment.previous_date || selectedAppointment.date}
            oldTime={selectedAppointment.previous_time || selectedAppointment.time}
            newDate={selectedAppointment.date}
            newTime={selectedAppointment.time}
            reason={selectedAppointment.reschedule_reason || ""}
            onValidate={handleValidateSuccess}
          />
        </>
      )}
    </Card>
  );
};
