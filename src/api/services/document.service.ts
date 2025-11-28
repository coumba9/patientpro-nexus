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
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        patients!documents_patient_id_fkey (
          id,
          profiles!patients_id_fkey (first_name, last_name)
        )
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents by doctor:', error);
      throw error;
    }
    
    return (data as any[]) || [];
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

  async signDocument(documentId: string): Promise<Document> {
    return this.update(documentId, {
      is_signed: true,
      signed_at: new Date().toISOString()
    });
  }
}

export const documentService = new DocumentService();
