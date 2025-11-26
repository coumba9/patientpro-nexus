import { BaseService, TableName } from "../base/base.service";
import { supabase } from "@/integrations/supabase/client";

export interface Invoice {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  payment_date?: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
}

class InvoiceService extends BaseService<Invoice> {
  constructor() {
    super('invoices' as TableName);
  }

  async getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
    
    return (data || []) as unknown as Invoice[];
  }

  async getInvoiceByAppointment(appointmentId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
    
    return data as unknown as Invoice | null;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from(this.tableName as any)
      .insert({ ...invoice, invoice_number: invoiceNumber })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
    
    return data as unknown as Invoice;
  }

  async updatePaymentStatus(invoiceId: string, status: Invoice['payment_status']): Promise<Invoice> {
    return this.update(invoiceId, {
      payment_status: status,
      payment_date: status === 'paid' ? new Date().toISOString() : undefined
    });
  }
}

export const invoiceService = new InvoiceService();
