
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { notificationService, ReminderData } from "@/api/services/notification.service";

export const ReminderSystem = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, [selectedDate]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getRemindersByDate(selectedDate);
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Erreur lors du chargement des rappels');
    } finally {
      setLoading(false);
    }
  };

  const handleReminderAction = async (reminderId: string, action: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId);
      if (!reminder) return;

      const newAttempts = reminder.attempts + 1;
      const newStatus = action === 'completed' ? 'completed' : reminder.status;

      await notificationService.updateReminderStatus(reminderId, newStatus, newAttempts);
      
      toast.success(`Rappel ${action === 'completed' ? 'marqué comme terminé' : 'mis à jour'}`);
      loadReminders(); // Recharger les données
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Erreur lors de la mise à jour du rappel');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "failed": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "phone": return <Phone className="h-4 w-4" />;
      case "sms": return <MessageSquare className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "24h": return "24 heures avant";
      case "2h": return "2 heures avant";
      case "manual": return "Rappel manuel";
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des rappels...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Système de rappels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            {reminders.length} rappel(s) pour cette date
          </div>
        </div>

        <div className="space-y-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {getMethodIcon(reminder.method)}
                        <span className="font-medium">{getTypeLabel(reminder.reminder_type)}</span>
                      </div>
                      <Badge variant={getStatusColor(reminder.status)}>
                        {reminder.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Patient ID:</span> {reminder.patient_id}</p>
                        <p><span className="font-medium">Rendez-vous ID:</span> {reminder.appointment_id}</p>
                        <p><span className="font-medium">Méthode:</span> {reminder.method}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Programmé pour:</span> {new Date(reminder.scheduled_for).toLocaleString()}</p>
                        <p><span className="font-medium">Tentatives:</span> {reminder.attempts}</p>
                        <p><span className="font-medium">Statut:</span> {reminder.status}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {reminder.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => handleReminderAction(reminder.id, "call")}>
                          <Phone className="h-3 w-3 mr-1" />
                          Appeler
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReminderAction(reminder.id, "sms")}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReminderAction(reminder.id, "completed")}>
                          Marquer terminé
                        </Button>
                      </>
                    )}
                    {reminder.status === "failed" && (
                      <Button size="sm" onClick={() => handleReminderAction(reminder.id, "retry")}>
                        Réessayer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {reminders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun rappel programmé pour cette date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
