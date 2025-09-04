import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationData as Notification } from '@/api/interfaces';
import { toast } from 'sonner';

export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Define fetchNotifications outside useEffect so it can be referenced in return
  const fetchNotifications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications((data as any[]) || []);
      setUnreadCount(((data as any[]) || []).filter((n: any) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast.success(newNotification.title, {
            description: newNotification.message,
            action: newNotification.appointment_id ? {
              label: "Voir",
              onClick: () => {
                // Navigate to appointment details
                window.location.href = `/appointment/${newNotification.appointment_id}`;
              }
            } : undefined
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification updated:', payload);
          
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === payload.new.id 
                ? { ...notif, ...payload.new }
                : notif
            )
          );
          
          // Update unread count if read status changed
          if (payload.old.is_read !== payload.new.is_read) {
            setUnreadCount(prev => payload.new.is_read ? prev - 1 : prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    refetch: fetchNotifications
  };
};