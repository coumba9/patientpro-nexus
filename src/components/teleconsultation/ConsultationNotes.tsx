import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Save, Loader2, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsultationNotesProps {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  onNotesSaved?: () => void;
}

export const ConsultationNotes = ({
  appointmentId,
  doctorId,
  patientId,
  patientName,
  onNotesSaved,
}: ConsultationNotesProps) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = `consultation-notes-${appointmentId}`;

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        setDiagnosis(draft.diagnosis || '');
        setNotes(draft.notes || '');
        setPrescription(draft.prescription || '');
      }
    } catch { /* ignore */ }
  }, [draftKey]);

  // Auto-save draft to localStorage on change
  const saveDraft = useCallback(() => {
    const draft = { diagnosis, notes, prescription, updatedAt: new Date().toISOString() };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setAutoSaveStatus('saved');
    setLastSaved(new Date());
    setTimeout(() => setAutoSaveStatus('idle'), 2000);
  }, [diagnosis, notes, prescription, draftKey]);

  useEffect(() => {
    if (!diagnosis && !notes && !prescription) return;
    setAutoSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(saveDraft, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [diagnosis, notes, prescription, saveDraft]);

  // Save to medical_records in Supabase
  const saveToMedicalRecords = async () => {
    if (!diagnosis.trim()) {
      toast.error('Veuillez saisir un diagnostic');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('medical_records').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        date: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || null,
        prescription: prescription.trim() || null,
      });

      if (error) throw error;

      // Also save a note linked to this consultation
      await supabase.from('notes').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        date: new Date().toISOString().split('T')[0],
        title: `Téléconsultation - ${patientName}`,
        content: [
          `**Diagnostic:** ${diagnosis}`,
          notes ? `**Notes:** ${notes}` : '',
          prescription ? `**Prescription:** ${prescription}` : '',
        ].filter(Boolean).join('\n\n'),
      });

      // Clear draft
      localStorage.removeItem(draftKey);
      toast.success('Notes de consultation enregistrées dans le dossier médical');
      onNotesSaved?.();
    } catch (error: any) {
      console.error('Error saving notes:', error);
      toast.error("Erreur lors de l'enregistrement: " + (error.message || 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  const hasContent = diagnosis.trim() || notes.trim() || prescription.trim();

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Notes de consultation</h3>
        </div>
        <div className="flex items-center gap-1">
          {autoSaveStatus === 'saving' && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Clock className="h-3 w-3" /> Sauvegarde...
            </Badge>
          )}
          {autoSaveStatus === 'saved' && (
            <Badge variant="secondary" className="text-[10px] gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" /> Brouillon sauvé
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Diagnostic *</Label>
            <Input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ex: Grippe saisonnière..."
              className="mt-1 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Notes cliniques</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, symptômes, examen clinique..."
              className="mt-1 text-sm min-h-[100px] resize-none"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Prescription</Label>
            <Textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Médicaments, posologie, durée..."
              className="mt-1 text-sm min-h-[80px] resize-none"
            />
          </div>

          {lastSaved && (
            <p className="text-[10px] text-muted-foreground text-right">
              Dernière sauvegarde locale: {lastSaved.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <Button
          onClick={saveToMedicalRecords}
          disabled={saving || !hasContent}
          className="w-full gap-2"
          size="sm"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer dans le dossier médical
        </Button>
      </div>
    </div>
  );
};
