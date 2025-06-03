
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Phone, Mail, MessageCircle, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ReminderTask {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  reminderType: "24h" | "2h" | "manual";
  status: "pending" | "completed" | "failed";
  method: "phone" | "sms" | "email";
  scheduledFor: string;
  attempts: number;
}

export const ReminderSystem = () => {
  const [autoReminders, setAutoReminders] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending");
  
  const [reminderTasks] = useState<ReminderTask[]>([
    {
      id: "1",
      patientName: "Marie Dubois",
      patientPhone: "01 23 45 67 89",
      patientEmail: "marie.dubois@email.com",
      appointmentDate: "2024-04-16",
      appointmentTime: "14:30",
      doctorName: "Dr. Martin",
      reminderType: "24h",
      status: "pending",
      method: "phone",
      scheduledFor: "2024-04-15 14:30",
      attempts: 0
    },
    {
      id: "2",
      patientName: "Jean Dupont",
      patientPhone: "01 23 45 67 90",
      patientEmail: "jean.dupont@email.com",
      appointmentDate: "2024-04-16",
      appointmentTime: "10:00",
      doctorName: "Dr. Leroy",
      reminderType: "2h",
      status: "completed",
      method: "sms",
      scheduledFor: "2024-04-16 08:00",
      attempts: 1
    },
    {
      id: "3",
      patientName: "Sophie Bernard",
      patientPhone: "01 23 45 67 91",
      patientEmail: "sophie.bernard@email.com",
      appointmentDate: "2024-04-15",
      appointmentTime: "16:00",
      doctorName: "Dr. Dubois",
      reminderType: "manual",
      status: "failed",
      method: "phone",
      scheduledFor: "2024-04-15 15:00",
      attempts: 3
    }
  ]);

  const filteredTasks = reminderTasks.filter(task => task.status === selectedTab);

  const handleCompleteReminder = (taskId: string, patientName: string) => {
    toast.success(`Rappel marqué comme effectué pour ${patientName}`);
  };

  const handleRetryReminder = (taskId: string, patientName: string, method: string) => {
    toast.success(`Nouveau rappel ${method} programmé pour ${patientName}`);
  };

  const handleManualCall = (patientName: string, phone: string) => {
    toast.success(`Appel en cours vers ${patientName} (${phone})`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "outline";
      case "pending": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Clock className="h-4 w-4 text-orange-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "phone": return <Phone className="h-3 w-3" />;
      case "sms": return <MessageCircle className="h-3 w-3" />;
      case "email": return <Mail className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Système de rappels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <Switch
            id="auto-reminders"
            checked={autoReminders}
            onCheckedChange={setAutoReminders}
          />
          <Label htmlFor="auto-reminders">
            Rappels automatiques activés
          </Label>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              En attente ({reminderTasks.filter(t => t.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Effectués ({reminderTasks.filter(t => t.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Échecs ({reminderTasks.filter(t => t.status === "failed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{task.patientName}</h4>
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status === "completed" ? "Effectué" :
                               task.status === "pending" ? "En attente" : "Échec"}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getMethodIcon(task.method)}
                              {task.method.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            <p>RDV: {task.appointmentDate} à {task.appointmentTime} avec {task.doctorName}</p>
                            <p>Rappel prévu: {task.scheduledFor}</p>
                            <p>Type: {task.reminderType} - Tentatives: {task.attempts}</p>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Tél: {task.patientPhone} | Email: {task.patientEmail}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {task.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleManualCall(task.patientName, task.patientPhone)}>
                              <Phone className="h-3 w-3 mr-1" />
                              Appeler maintenant
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleCompleteReminder(task.id, task.patientName)}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Marquer effectué
                            </Button>
                          </>
                        )}
                        {task.status === "failed" && (
                          <>
                            <Button size="sm" onClick={() => handleRetryReminder(task.id, task.patientName, "phone")}>
                              <Phone className="h-3 w-3 mr-1" />
                              Réessayer appel
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRetryReminder(task.id, task.patientName, "sms")}>
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Envoyer SMS
                            </Button>
                          </>
                        )}
                        {task.status === "completed" && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun rappel dans cette catégorie
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
