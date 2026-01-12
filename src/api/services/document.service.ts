import { BaseService, TableName } from "../base/base.service";
import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  patient_id: string;
  doctor_id: string;
  title: string;
  type: string;
  file_url?: string;
  file_size?: number;
  is_signed: boolean;
  signed_at?: string;
  signature_url?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  };
}

class DocumentService extends BaseService<Document> {
  constructor() {
    super('documents' as TableName);
  }

  async getDocumentsByDoctor(doctorId: string): Promise<Document[]> {
    // First get documents
    const { data: documents, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents by doctor:', error);
      throw error;
    }
    
    if (!documents || documents.length === 0) {
      return [];
    }

    // Get unique patient IDs
    const patientIds = [...new Set(documents.map((doc: any) => doc.patient_id))];
    
    // Fetch patient profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', patientIds);
    
    if (profilesError) {
      console.error('Error fetching patient profiles:', profilesError);
    }
    
    // Create profile map
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    
    // Merge data
    return documents.map((doc: any) => ({
      ...doc,
      patient: {
        id: doc.patient_id,
        profile: profileMap.get(doc.patient_id) || { first_name: 'Patient', last_name: 'inconnu' }
      }
    }));
  }

  async getDocumentsByPatient(patientId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents by patient:', error);
      throw error;
    }
    
    return (data as any[]) || [];
  }

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .insert(document)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }
    
    return data as any;
  }

  async uploadSignature(doctorId: string, signatureDataUrl: string): Promise<string> {
    // Convert base64 data URL to blob
    const base64Data = signatureDataUrl.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Create unique filename
    const fileName = `${doctorId}/${Date.now()}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('signatures')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async signDocument(documentId: string, signatureUrl?: string): Promise<Document> {
    const updateData: any = {
      is_signed: true,
      signed_at: new Date().toISOString()
    };

    if (signatureUrl) {
      updateData.signature_url = signatureUrl;
    }

    return this.update(documentId, updateData);
  }

  async getSignatureUrl(documentId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('signature_url')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching signature URL:', error);
      return null;
    }

    return (data as any)?.signature_url || null;
  }
}

export const documentService = new DocumentService();
