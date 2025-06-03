
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Phone, Mail, Calendar, Clock, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "cancellation" | "reminder" | "queue";
  title: string;
  message: string;
  appointmentId?: string;
  patientName?: string;
  doctorName?: string;
  date: string;
  time: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "cancellation",
      title: "Rendez-vous annulé",
      message: "Dr. Martin a annulé son rendez-vous avec Marie Dubois",
      appointmentId: "apt-1",
      patientName: "Marie Dubois",
      doctorName: "Dr. Martin",
      date: "2024-04-20",
      time: "14:30",
      isRead: false,
      priority: "high"
    },
    {
      id: "2",
      type: "reminder",
      title: "Rappel à effectuer",
      message: "Rappeler Jean Dupont pour son RDV de demain",
      appointmentId: "apt-2",
      patientName: "Jean Dupont",
      doctorName: "Dr. Leroy",
      date: "2024-04-16",
      time: "10:00",
      isRead: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "queue",
      title: "Patient en file d'attente",
      message: "Sophie Bernard souhaite un RDV avec Dr. Martin",
      patientName: "Sophie Bernard",
      doctorName: "Dr. Martin",
      date: "2024-04-18",
      time: "16:00",
      isRead: true,
      priority: "low"
    }
  ]);

  const [selectedTab, setSelectedTab] = useState("all");

  const filteredNotifications = notifications.filter(notif => {
    if (selectedTab === "all") return true;
    if (selectedTab === "unread") return !notif.isRead;
    return notif.type === selectedTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleCallPatient = (patientName: string, appointmentId: string) => {
    toast.success(`Appel en cours vers ${patientName}`);
    markAsRead(appointmentId);
  };

  const handleSendReminder = (patientName: string, type: "sms" | "email") => {
    toast.success(`${type === "sms" ? "SMS" : "Email"} de rappel envoyé à ${patientName}`);
  };

  const handleAssignFromQueue = (patientName: string) => {
    toast.success(`Créneau proposé à ${patientName}`);
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
              Non lues ({notifications.filter(n => !n.isRead).length})
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
                <Card key={notification.id} className={`border-l-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
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
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-blue-500">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {notification.date} à {notification.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {notification.type === "cancellation" && (
                          <>
                            <Button size="sm" onClick={() => handleCallPatient(notification.patientName!, notification.id)}>
                              <Phone className="h-3 w-3 mr-1" />
                              Appeler
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAssignFromQueue(notification.patientName!)}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Réassigner
                            </Button>
                          </>
                        )}
                        {notification.type === "reminder" && (
                          <>
                            <Button size="sm" onClick={() => handleCallPatient(notification.patientName!, notification.id)}>
                              <Phone className="h-3 w-3 mr-1" />
                              Appeler
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleSendReminder(notification.patientName!, "sms")}>
                              <Mail className="h-3 w-3 mr-1" />
                              SMS
                            </Button>
                          </>
                        )}
                        {notification.type === "queue" && (
                          <Button size="sm" onClick={() => handleAssignFromQueue(notification.patientName!)}>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Assigner
                          </Button>
                        )}
                        {!notification.isRead && (
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
