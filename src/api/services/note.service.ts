
import { BaseService, TableName } from "../base/base.service";
import { Note } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class NoteService extends BaseService<Note> {
  constructor() {
    super('notes' as TableName);
  }

  async getNotesByPatient(patientId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        doctor:doctor_id (
          id,
          profile:id (first_name, last_name)
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes by patient:', error);
      throw error;
    }
    
    return data as unknown as Note[];
  }

  async getNotesByDoctor(doctorId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        patient:patient_id (
          id,
          profile:id (first_name, last_name)
        )
      `)
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes by doctor:', error);
      throw error;
    }
    
    return data as unknown as Note[];
  }

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    return this.create(note);
  }

  async updateNote(id: string, note: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<Note> {
    return this.update(id, note);
  }
}

export const noteService = new NoteService();
