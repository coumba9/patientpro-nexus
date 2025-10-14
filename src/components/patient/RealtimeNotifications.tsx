import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface RealtimeNotificationsProps {
  userId: string | null;
  userRole?: 'doctor' | 'patient';
}

export const RealtimeNotifications = ({ userId, userRole }: RealtimeNotificationsProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications(userId);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Redirect to appointment details if appointment_id exists
    if (notification.appointment_id) {
      const basePath = userRole === 'doctor' ? '/doctor' : '/patient';
      navigate(`${basePath}/appointment/${notification.appointment_id}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${
                    !notification.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      variant={
                        notification.priority === 'high' ? 'destructive' :
                        notification.priority === 'medium' ? 'default' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {notification.priority === 'high' ? 'Urgent' :
                       notification.priority === 'medium' ? 'Important' :
                       'Info'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {notification.type === 'appointment_created' ? 'Rendez-vous' :
                       notification.type === 'appointment_status_changed' ? 'Statut' :
                       notification.type === 'appointment_cancelled' ? 'Annulation' :
                       notification.type === 'appointment_reschedule_request' ? 'Report demandé' :
                       notification.type === 'medical_record' ? 'Dossier médical' :
                       notification.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};