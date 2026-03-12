import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RealtimeMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  appointment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  contactId: string;
  contactName: string;
  lastMessage: RealtimeMessage;
  unreadCount: number;
}

export function useRealtimeMessages(userId: string | undefined) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, { first_name: string; last_name: string }>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as RealtimeMessage[]) || []);

      // Fetch unique contact profiles
      const contactIds = new Set<string>();
      (data || []).forEach((m: any) => {
        if (m.sender_id !== userId) contactIds.add(m.sender_id);
        if (m.receiver_id !== userId) contactIds.add(m.receiver_id);
      });

      if (contactIds.size > 0) {
        const profilePromises = Array.from(contactIds).map(async (id) => {
          const { data: pData } = await supabase.rpc("get_safe_profile", { target_user_id: id });
          if (pData && pData.length > 0) {
            return { id, first_name: pData[0].first_name || "", last_name: pData[0].last_name || "" };
          }
          return { id, first_name: "Utilisateur", last_name: "" };
        });
        const results = await Promise.all(profilePromises);
        const map: Record<string, { first_name: string; last_name: string }> = {};
        results.forEach((r) => { map[r.id] = { first_name: r.first_name, last_name: r.last_name }; });
        setProfiles((prev) => ({ ...prev, ...map }));
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Subscribe to realtime
  useEffect(() => {
    if (!userId) return;
    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as RealtimeMessage;
          if (newMsg.sender_id === userId || newMsg.receiver_id === userId) {
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.receiver_id === userId) {
              toast.info("Nouveau message reçu", { description: newMsg.subject });
            }
            // Fetch profile if unknown
            const contactId = newMsg.sender_id === userId ? newMsg.receiver_id : newMsg.sender_id;
            if (!profiles[contactId]) {
              supabase.rpc("get_safe_profile", { target_user_id: contactId }).then(({ data }) => {
                if (data && data.length > 0) {
                  setProfiles((prev) => ({
                    ...prev,
                    [contactId]: { first_name: data[0].first_name || "", last_name: data[0].last_name || "" },
                  }));
                }
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as RealtimeMessage;
          if (updated.sender_id === userId || updated.receiver_id === userId) {
            setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMessages]);

  const sendMessage = useCallback(
    async (receiverId: string, content: string, subject: string, appointmentId?: string) => {
      if (!userId) return;
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: receiverId,
        content,
        subject,
        is_read: false,
        appointment_id: appointmentId || null,
      });
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Erreur lors de l'envoi du message");
        throw error;
      }
    },
    [userId]
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
    },
    []
  );

  const markConversationAsRead = useCallback(
    async (contactId: string) => {
      if (!userId) return;
      const unread = messages.filter((m) => m.sender_id === contactId && m.receiver_id === userId && !m.is_read);
      await Promise.all(unread.map((m) => markAsRead(m.id)));
    },
    [userId, messages, markAsRead]
  );

  // Build conversations
  const conversations: Conversation[] = (() => {
    if (!userId) return [];
    const convMap = new Map<string, { messages: RealtimeMessage[]; unread: number }>();

    messages.forEach((m) => {
      const contactId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!convMap.has(contactId)) convMap.set(contactId, { messages: [], unread: 0 });
      const conv = convMap.get(contactId)!;
      conv.messages.push(m);
      if (m.receiver_id === userId && !m.is_read) conv.unread++;
    });

    return Array.from(convMap.entries())
      .map(([contactId, { messages: msgs, unread }]) => {
        const last = msgs[msgs.length - 1];
        const profile = profiles[contactId];
        const contactName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Contact";
        return { contactId, contactName, lastMessage: last, unreadCount: unread };
      })
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
  })();

  const getConversationMessages = useCallback(
    (contactId: string) => {
      if (!userId) return [];
      return messages.filter(
        (m) =>
          (m.sender_id === userId && m.receiver_id === contactId) ||
          (m.sender_id === contactId && m.receiver_id === userId)
      );
    },
    [userId, messages]
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    messages,
    conversations,
    loading,
    totalUnread,
    profiles,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    getConversationMessages,
    refetch: fetchMessages,
  };
}
