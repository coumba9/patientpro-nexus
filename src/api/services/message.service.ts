import { BaseService, TableName } from "../base/base.service";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  receiver?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

class MessageService extends BaseService<Message> {
  constructor() {
    super('messages' as TableName);
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        sender:sender_id (id, first_name, last_name, email),
        receiver:receiver_id (id, first_name, last_name, email)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    return (data as any[]) || [];
  }

  async sendMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at' | 'is_read'>): Promise<Message> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .insert({
        ...message,
        is_read: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
    
    return data as any;
  }

  async markAsRead(messageId: string): Promise<Message> {
    return this.update(messageId, { is_read: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName as any)
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error counting unread messages:', error);
      return 0;
    }
    
    return count || 0;
  }
}

export const messageService = new MessageService();
