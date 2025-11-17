
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PrescriptionCard } from "@/components/patient/PrescriptionCard";
import { useAuth } from "@/hooks/useAuth";

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
        const { medicalRecordService } = await import("@/api");
        const records = await medicalRecordService.getRecordsByPatient(user.id);
        
        // Transformer les records en format prescription
        const transformedPrescriptions = records
          .filter(record => record.prescription)
          .map((record, index) => ({
            id: index + 1,
            recordId: record.id,
            date: record.date,
            doctor: `Dr. ${(record as any).doctor?.profile?.first_name || ''} ${(record as any).doctor?.profile?.last_name || ''}`.trim() || "Médecin",
            medications: record.prescription ? [
              { name: record.prescription, dosage: "Selon prescription", frequency: "Voir ordonnance" }
            ] : [],
            duration: "Voir ordonnance",
            signed: true,
            patientName: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
            patientAge: "N/A",
            diagnosis: record.diagnosis,
            doctorSpecialty: (record as any).doctor?.specialty?.name || "Médecin généraliste",
            doctorAddress: "Cabinet médical"
          }));
        
        setPrescriptions(transformedPrescriptions);
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
      // Importer jsPDF et html2canvas dynamiquement
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Créer une div temporaire avec le contenu de l'ordonnance
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
              <p style="font-size: 14px; color: #9ca3af; margin: 10px 0 0 0;">${prescription.doctorAddress || "Cabinet médical"}</p>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0 0 10px 0;">ORDONNANCE</h1>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Date: ${prescription.date}</p>
            </div>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="font-weight: 600; color: #111827; margin: 0 0 15px 0;">Informations du patient</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 5px 0;"><span style="font-weight: 500;">Nom:</span> ${prescription.patientName || "Patient"}</p>
              <p style="margin: 5px 0;"><span style="font-weight: 500;">Âge:</span> ${prescription.patientAge || "N/A"}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><span style="font-weight: 500;">Date de consultation:</span> ${prescription.date}</p>
              ${prescription.diagnosis ? `<p style="margin: 5px 0;"><span style="font-weight: 500;">Diagnostic:</span> ${prescription.diagnosis}</p>` : ''}
            </div>
          </div>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="font-weight: 600; color: #111827; margin: 0 0 20px 0; font-size: 20px;">Prescription médicamenteuse</h3>
          ${prescription.medications.map((med, idx) => `
            <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #eff6ff;">
              <h4 style="font-weight: bold; font-size: 18px; color: #111827; margin: 0 0 8px 0;">${med.name}</h4>
              <p style="color: #374151; margin: 5px 0;"><span style="font-weight: 500;">Dosage:</span> ${med.dosage}</p>
              <p style="color: #374151; margin: 5px 0;"><span style="font-weight: 500;">Posologie:</span> ${med.frequency}</p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Durée: ${prescription.duration}</p>
            </div>
          `).join('')}
        </div>

        <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h4 style="font-weight: 600; color: #111827; margin: 0 0 10px 0;">Instructions importantes</h4>
          <ul style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Respecter scrupuleusement la posologie indiquée</li>
            <li>Terminer le traitement même en cas d'amélioration</li>
            <li>En cas d'effets indésirables, contacter immédiatement votre médecin</li>
            <li>Conserver les médicaments dans un endroit sec et à l'abri de la lumière</li>
          </ul>
        </div>

        ${prescription.signed ? `
          <div style="margin-top: 40px; text-align: right;">
            <p style="color: #374151; margin-bottom: 20px;">Fait le ${prescription.date}</p>
            <div style="border-top: 1px solid #d1d5db; padding-top: 20px; width: 250px; margin-left: auto;">
              <p style="font-weight: 600; margin: 0;">${prescription.doctor}</p>
              <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Signature et cachet</p>
            </div>
          </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            Cette ordonnance est valide pour une durée déterminée. 
            Consultez votre pharmacien pour plus d'informations.
          </p>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Générer le canvas à partir du HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Télécharger le PDF
      pdf.save(`ordonnance-${prescription.date}.pdf`);

      // Nettoyer
      document.body.removeChild(tempDiv);
      
      toast.success("Ordonnance téléchargée en PDF avec succès");
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
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
        
        <h2 className="text-2xl font-bold mb-6">Mes Ordonnances</h2>
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
