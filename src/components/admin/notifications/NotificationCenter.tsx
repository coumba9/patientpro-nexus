
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Phone, Mail, Calendar, Clock, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { notificationService, NotificationData } from "@/api/services/notification.service";
import { useAuth } from "@/hooks/useAuth";

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationsByUser(user!.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedTab === "all") return true;
    if (selectedTab === "unread") return !notif.is_read;
    return notif.type === selectedTab;
  });

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erreur lors du marquage de la notification');
    }
  };

  const handleCallPatient = (notificationId: string) => {
    toast.success(`Appel en cours`);
    markAsRead(notificationId);
  };

  const handleSendReminder = (type: "sms" | "email") => {
    toast.success(`${type === "sms" ? "SMS" : "Email"} de rappel envoyé`);
  };

  const handleAssignFromQueue = () => {
    toast.success(`Créneau proposé`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cancellation": return <UserX className="h-4 w-4" />;
      case "reminder": return <Clock className="h-4 w-4" />;
      case "queue": return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Centre de notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({notifications.filter(n => !n.is_read).length})
            </TabsTrigger>
            <TabsTrigger value="cancellation">
              Annulations
            </TabsTrigger>
            <TabsTrigger value="reminder">
              Rappels
            </TabsTrigger>
            <TabsTrigger value="queue">
              File d'attente
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`border-l-4 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.is_read && (
                              <Badge variant="default" className="bg-blue-500">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(notification.created_at!).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {notification.type === "cancellation" && (
                          <>
                            <Button size="sm" onClick={() => handleCallPatient(notification.id)}>
                              <Phone className="h-3 w-3 mr-1" />
                              Appeler
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAssignFromQueue()}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Réassigner
                            </Button>
                          </>
                        )}
                        {notification.type === "reminder" && (
                          <>
                            <Button size="sm" onClick={() => handleCallPatient(notification.id)}>
                              <Phone className="h-3 w-3 mr-1" />
                              Appeler
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleSendReminder("sms")}>
                              <Mail className="h-3 w-3 mr-1" />
                              SMS
                            </Button>
                          </>
                        )}
                        {notification.type === "queue" && (
                          <Button size="sm" onClick={() => handleAssignFromQueue()}>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Assigner
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune notification pour cette catégorie
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
