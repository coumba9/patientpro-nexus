import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Save, Loader2, CheckCircle, Clock, Sparkles, Copy, Check } from 'lucide-react';

interface ConsultationNotesProps {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  callDuration?: number;
  onNotesSaved?: () => void;
  onUnsavedChange?: (hasUnsaved: boolean) => void;
}

export const ConsultationNotes = ({
  appointmentId,
  doctorId,
  patientId,
  patientName,
  callDuration,
  onNotesSaved,
  onUnsavedChange,
}: ConsultationNotesProps) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiSummary, setAiSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = `consultation-notes-${appointmentId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        setDiagnosis(draft.diagnosis || '');
        setNotes(draft.notes || '');
        setPrescription(draft.prescription || '');
        if (draft.aiSummary) setAiSummary(draft.aiSummary);
      }
    } catch { /* ignore */ }
  }, [draftKey]);

  const saveDraft = useCallback(() => {
    const draft = { diagnosis, notes, prescription, aiSummary, updatedAt: new Date().toISOString() };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setAutoSaveStatus('saved');
    setLastSaved(new Date());
    setTimeout(() => setAutoSaveStatus('idle'), 2000);
  }, [diagnosis, notes, prescription, aiSummary, draftKey]);

  useEffect(() => {
    if (!diagnosis && !notes && !prescription) return;
    onUnsavedChange?.(true);
    setAutoSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(saveDraft, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [diagnosis, notes, prescription, saveDraft, onUnsavedChange]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return m > 0 ? `${m} min` : `${seconds} sec`;
  };

  // Stream AI summary
  const generateSummary = async () => {
    if (!diagnosis.trim()) {
      toast.error('Saisissez un diagnostic avant de générer la synthèse');
      return;
    }

    setGeneratingSummary(true);
    setAiSummary('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consultation-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            diagnosis,
            notes,
            prescription,
            patientName,
            callDuration: callDuration ? formatDuration(callDuration) : undefined,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(err.error || `Erreur ${resp.status}`);
      }

      if (!resp.body) throw new Error('Pas de stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setAiSummary(accumulated);
            }
          } catch { /* partial JSON, wait */ }
        }
      }

      toast.success('Synthèse IA générée');
    } catch (e: any) {
      console.error('AI summary error:', e);
      toast.error(e.message || 'Erreur lors de la génération');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToMedicalRecords = async () => {
    if (!diagnosis.trim()) {
      toast.error('Veuillez saisir un diagnostic');
      return;
    }

    setSaving(true);
    try {
      const fullNotes = [
        notes.trim(),
        aiSummary ? `\n---\n**Synthèse IA:**\n${aiSummary}` : '',
      ].filter(Boolean).join('\n');

      const { error } = await supabase.from('medical_records').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        date: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis.trim(),
        notes: fullNotes || null,
        prescription: prescription.trim() || null,
      });

      if (error) throw error;

      await supabase.from('notes').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        date: new Date().toISOString().split('T')[0],
        title: `Téléconsultation - ${patientName}`,
        content: [
          `**Diagnostic:** ${diagnosis}`,
          notes ? `**Notes:** ${notes}` : '',
          prescription ? `**Prescription:** ${prescription}` : '',
          aiSummary ? `\n---\n**Synthèse IA:**\n${aiSummary}` : '',
        ].filter(Boolean).join('\n\n'),
      });

      localStorage.removeItem(draftKey);
      toast.success('Notes et synthèse enregistrées dans le dossier médical');
      onUnsavedChange?.(false);
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
              className="mt-1 text-sm min-h-[80px] resize-none"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Prescription</Label>
            <Textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Médicaments, posologie, durée..."
              className="mt-1 text-sm min-h-[60px] resize-none"
            />
          </div>

          {/* AI Summary Section */}
          <div className="border border-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Synthèse IA</span>
              </div>
              <div className="flex items-center gap-1">
                {aiSummary && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2"
                  onClick={generateSummary}
                  disabled={generatingSummary || !diagnosis.trim()}
                >
                  {generatingSummary ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {generatingSummary ? 'Génération...' : 'Générer'}
                </Button>
              </div>
            </div>
            {aiSummary ? (
              <div className="p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                {aiSummary}
                {generatingSummary && <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5" />}
              </div>
            ) : (
              <div className="p-3 text-[10px] text-muted-foreground text-center">
                {generatingSummary
                  ? 'Génération de la synthèse en cours...'
                  : 'Remplissez les notes puis cliquez sur "Générer" pour créer une synthèse automatique'}
              </div>
            )}
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
