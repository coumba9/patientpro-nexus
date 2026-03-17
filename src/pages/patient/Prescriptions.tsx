import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PrescriptionCard } from "@/components/patient/PrescriptionCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Prescriptions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);

        // Direct Supabase query instead of service with complex joins
        const { data: records, error } = await supabase
          .from('medical_records')
          .select('id, date, diagnosis, prescription, notes, doctor_id')
          .eq('patient_id', user.id)
          .not('prescription', 'is', null)
          .order('date', { ascending: false });

        if (error) throw error;

        if (!records || records.length === 0) {
          setPrescriptions([]);
          return;
        }

        // Batch fetch doctor profiles
        const doctorIds = [...new Set(records.map(r => r.doctor_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', doctorIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        const transformed = records.map((record, index) => {
          const docProfile = profileMap.get(record.doctor_id);
          const doctorName = docProfile
            ? `Dr. ${docProfile.first_name || ''} ${docProfile.last_name || ''}`.trim()
            : 'Médecin';

          return {
            id: index + 1,
            recordId: record.id,
            date: record.date,
            doctor: doctorName,
            medications: record.prescription ? [
              { name: record.prescription, dosage: "Selon prescription", frequency: "Voir ordonnance" }
            ] : [],
            duration: "Voir ordonnance",
            signed: true,
            patientName: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
            patientAge: "N/A",
            diagnosis: record.diagnosis,
            doctorSpecialty: "Médecin",
            doctorAddress: "Cabinet médical"
          };
        });
        
        setPrescriptions(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des ordonnances:", error);
        toast.error("Erreur lors du chargement des ordonnances");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  const handleDownload = async (prescriptionId: number) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';

      tempDiv.innerHTML = `
        <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 10px 0;">${prescription.doctor}</h2>
              <p style="color: #6b7280; margin: 0;">${prescription.doctorSpecialty || "Médecin généraliste"}</p>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0 0 10px 0;">ORDONNANCE</h1>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Date: ${prescription.date}</p>
            </div>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="font-weight: 600; color: #111827; margin: 0 0 15px 0;">Patient</h3>
          <p style="margin: 5px 0;"><span style="font-weight: 500;">Nom:</span> ${prescription.patientName || "Patient"}</p>
          ${prescription.diagnosis ? `<p style="margin: 5px 0;"><span style="font-weight: 500;">Diagnostic:</span> ${prescription.diagnosis}</p>` : ''}
        </div>
        <div style="margin: 30px 0;">
          <h3 style="font-weight: 600; font-size: 20px; margin: 0 0 20px 0;">Prescription</h3>
          ${prescription.medications.map((med: any) => `
            <div style="margin: 15px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #eff6ff;">
              <h4 style="font-weight: bold; font-size: 16px; margin: 0 0 8px 0;">${med.name}</h4>
              <p style="color: #374151; margin: 5px 0;">Dosage: ${med.dosage}</p>
              <p style="color: #374151; margin: 5px 0;">Posologie: ${med.frequency}</p>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 40px; text-align: right;">
          <p style="color: #374151;">Fait le ${prescription.date}</p>
          <div style="border-top: 1px solid #d1d5db; padding-top: 20px; width: 250px; margin-left: auto;">
            <p style="font-weight: 600; margin: 0;">${prescription.doctor}</p>
            <p style="font-size: 14px; color: #6b7280;">Signature et cachet</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 295;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 295;
      }

      pdf.save(`ordonnance-${prescription.date}.pdf`);
      document.body.removeChild(tempDiv);
      toast.success("Ordonnance téléchargée en PDF");
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg shadow-sm p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Mes Ordonnances</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune ordonnance</h3>
            <p className="text-muted-foreground">
              Vos ordonnances apparaîtront ici après vos consultations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
