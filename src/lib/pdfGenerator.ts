import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorAddress?: string;
  consultationType: string;
  consultationMode: string;
  amount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
}

interface PrescriptionData {
  date: string;
  patientName: string;
  patientAge?: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorAddress?: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
  }>;
  notes?: string;
  signed?: boolean;
  signatureUrl?: string;
}

export const generateInvoicePDF = (data: InvoiceData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with logo placeholder
  doc.setFillColor(34, 197, 94); // Green color for JàmmSanté
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('JàmmSanté', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Votre santé, notre priorité', 20, 33);
  
  // Invoice title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - 20, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`N° ${data.invoiceNumber}`, pageWidth - 20, 33, { align: 'right' });
  
  // Date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Date: ${data.date}`, pageWidth - 20, 50, { align: 'right' });
  
  // Patient info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du patient', 20, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom: ${data.patientName}`, 20, 70);
  if (data.patientEmail) doc.text(`Email: ${data.patientEmail}`, 20, 77);
  if (data.patientPhone) doc.text(`Téléphone: ${data.patientPhone}`, 20, 84);
  
  // Doctor info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Praticien', pageWidth / 2 + 10, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Dr. ${data.doctorName}`, pageWidth / 2 + 10, 70);
  if (data.doctorSpecialty) doc.text(data.doctorSpecialty, pageWidth / 2 + 10, 77);
  if (data.doctorAddress) doc.text(data.doctorAddress, pageWidth / 2 + 10, 84);
  
  // Consultation details table
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 100, pageWidth - 40, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description', 25, 107);
  doc.text('Type', 80, 107);
  doc.text('Mode', 120, 107);
  doc.text('Montant', pageWidth - 45, 107);
  
  // Table content
  doc.setFont('helvetica', 'normal');
  doc.rect(20, 100, pageWidth - 40, 20, 'S');
  doc.text('Consultation médicale', 25, 117);
  doc.text(data.consultationType, 80, 117);
  doc.text(data.consultationMode === 'in_person' ? 'En cabinet' : 'Téléconsultation', 120, 117);
  doc.text(`${data.amount.toLocaleString()} FCFA`, pageWidth - 45, 117);
  
  // Total
  doc.setFillColor(34, 197, 94);
  doc.rect(pageWidth - 80, 130, 60, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${data.amount.toLocaleString()} FCFA`, pageWidth - 25, 138, { align: 'right' });
  
  // Payment status
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de paiement', 20, 160);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const statusColor = data.paymentStatus === 'paid' ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Statut: ${data.paymentStatus === 'paid' ? 'Payé' : 'En attente'}`, 20, 170);
  
  doc.setTextColor(0, 0, 0);
  if (data.paymentMethod) doc.text(`Méthode: ${data.paymentMethod}`, 20, 177);
  if (data.paymentDate) doc.text(`Date de paiement: ${data.paymentDate}`, 20, 184);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('JàmmSanté - Plateforme de santé en ligne', pageWidth / 2, 270, { align: 'center' });
  doc.text('www.jammsante.sn | contact@jammsante.sn', pageWidth / 2, 277, { align: 'center' });
  doc.text('Cette facture est générée automatiquement et fait foi de preuve de paiement.', pageWidth / 2, 284, { align: 'center' });
  
  // Save the PDF
  doc.save(`facture_${data.invoiceNumber}.pdf`);
};

export const generatePrescriptionPDF = async (data: PrescriptionData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(59, 130, 246); // Blue color
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo and title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('JàmmSanté', 20, 20);
  
  doc.setFontSize(16);
  doc.text('ORDONNANCE MÉDICALE', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${data.date}`, pageWidth - 20, 28, { align: 'right' });
  
  // Doctor info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Praticien', 20, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Dr. ${data.doctorName}`, 20, 60);
  if (data.doctorSpecialty) doc.text(data.doctorSpecialty, 20, 67);
  if (data.doctorAddress) doc.text(data.doctorAddress, 20, 74);
  
  // Patient info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient', pageWidth / 2 + 10, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom: ${data.patientName}`, pageWidth / 2 + 10, 60);
  if (data.patientAge) doc.text(`Âge: ${data.patientAge}`, pageWidth / 2 + 10, 67);
  
  // Diagnosis
  doc.setFillColor(254, 226, 226);
  doc.rect(20, 85, pageWidth - 40, 20, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('Diagnostic:', 25, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(data.diagnosis, 25, 102);
  
  // Medications
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescription', 20, 120);
  
  let yPos = 130;
  data.medications.forEach((med, index) => {
    doc.setFillColor(239, 246, 255);
    doc.rect(20, yPos - 5, pageWidth - 40, 25, 'F');
    
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.line(20, yPos - 5, 20, yPos + 20);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${med.name}`, 25, yPos + 3);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Dosage: ${med.dosage}`, 25, yPos + 10);
    doc.text(`Posologie: ${med.frequency}`, 25, yPos + 17);
    if (med.duration) {
      doc.text(`Durée: ${med.duration}`, pageWidth - 60, yPos + 10);
    }
    
    yPos += 30;
  });
  
  // Notes
  if (data.notes) {
    doc.setFillColor(254, 249, 195);
    doc.rect(20, yPos, pageWidth - 40, 25, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 77, 14);
    doc.text('Notes:', 25, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(data.notes, 25, yPos + 16);
    yPos += 30;
  }
  
  // Signature section
  if (data.signed) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fait le ${data.date}`, pageWidth - 70, yPos + 10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${data.doctorName}`, pageWidth - 70, yPos + 20);
    
    // Add signature image if available
    if (data.signatureUrl) {
      try {
        // Load signature image
        const response = await fetch(data.signatureUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        
        // Add signature image to PDF
        doc.addImage(base64, 'PNG', pageWidth - 90, yPos + 25, 60, 25);
        
        // Add "Signé électroniquement" badge
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(pageWidth - 90, yPos + 52, 70, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Signé électroniquement', pageWidth - 55, yPos + 57, { align: 'center' });
      } catch (error) {
        console.error('Error loading signature image:', error);
        // Fallback to text signature
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Signature et cachet', pageWidth - 70, yPos + 27);
        doc.setDrawColor(0, 0, 0);
        doc.line(pageWidth - 90, yPos + 35, pageWidth - 20, yPos + 35);
      }
    } else {
      // Text signature fallback
      doc.setFont('helvetica', 'normal');
      doc.text('Signature et cachet', pageWidth - 70, yPos + 27);
      doc.setDrawColor(0, 0, 0);
      doc.line(pageWidth - 90, yPos + 35, pageWidth - 20, yPos + 35);
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Cette ordonnance est valable pour la durée du traitement prescrit.', pageWidth / 2, 270, { align: 'center' });
  doc.text('JàmmSanté - Plateforme de santé en ligne', pageWidth / 2, 277, { align: 'center' });
  
  // Save the PDF
  doc.save(`ordonnance_${data.patientName.replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`);
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateMedicalReportPDF = (data: {
  date: string;
  patientName: string;
  patientAge?: string;
  doctorName: string;
  doctorSpecialty?: string;
  diagnosis: string;
  notes?: string;
  prescription?: string;
}): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('JàmmSanté', 20, 20);
  
  doc.setFontSize(16);
  doc.text('COMPTE-RENDU MÉDICAL', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${data.date}`, pageWidth - 20, 28, { align: 'right' });
  
  // Patient info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du patient', 20, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom: ${data.patientName}`, 20, 60);
  if (data.patientAge) doc.text(`Âge: ${data.patientAge}`, 20, 67);
  
  // Doctor info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Praticien', pageWidth / 2 + 10, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Dr. ${data.doctorName}`, pageWidth / 2 + 10, 60);
  if (data.doctorSpecialty) doc.text(data.doctorSpecialty, pageWidth / 2 + 10, 67);
  
  // Diagnosis
  doc.setFillColor(254, 226, 226);
  doc.rect(20, 80, pageWidth - 40, 25, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('Diagnostic', 25, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const diagnosisLines = doc.splitTextToSize(data.diagnosis, pageWidth - 50);
  doc.text(diagnosisLines, 25, 98);
  
  let yPos = 115;
  
  // Prescription if exists
  if (data.prescription) {
    doc.setFillColor(239, 246, 255);
    doc.rect(20, yPos, pageWidth - 40, 30, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Prescription', 25, yPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const prescriptionLines = doc.splitTextToSize(data.prescription, pageWidth - 50);
    doc.text(prescriptionLines, 25, yPos + 18);
    yPos += 40;
  }
  
  // Notes if exists
  if (data.notes) {
    doc.setFillColor(254, 249, 195);
    doc.rect(20, yPos, pageWidth - 40, 30, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 77, 14);
    doc.text('Notes et recommandations', 25, yPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const notesLines = doc.splitTextToSize(data.notes, pageWidth - 50);
    doc.text(notesLines, 25, yPos + 18);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Document généré automatiquement par JàmmSanté', pageWidth / 2, 270, { align: 'center' });
  doc.text('Ce document fait foi de compte-rendu de consultation.', pageWidth / 2, 277, { align: 'center' });
  
  doc.save(`compte_rendu_${data.patientName.replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`);
};
