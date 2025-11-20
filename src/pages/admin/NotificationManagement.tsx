
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, Users, BarChart } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationCenter } from "@/components/admin/notifications/NotificationCenter";
import { ReminderSystem } from "@/components/admin/reminders/ReminderSystem";
import { WaitingQueue } from "@/components/admin/queue/WaitingQueue";
import { useAdminQueue } from "@/hooks/useAdminQueue";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const NotificationManagement = () => {
  const { stats: queueStats, loading: queueLoading } = useAdminQueue();
  const [notificationStats, setNotificationStats] = useState({ unread: 0, total: 0 });
  const [reminderStats, setReminderStats] = useState({ pending: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch notification stats
      const { count: unreadCount } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      const { count: totalCount } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });

      setNotificationStats({
        unread: unreadCount || 0,
        total: totalCount || 0,
      });

      // Fetch reminder stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: pendingReminders } = await supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: todayReminders } = await supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_for", today.toISOString())
        .lt("scheduled_for", tomorrow.toISOString());

      setReminderStats({
        pending: pendingReminders || 0,
        today: todayReminders || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Gestion des notifications</h1>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notifications non lues
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{notificationStats.unread}</div>
                    <p className="text-xs text-muted-foreground">
                      Sur {notificationStats.total} total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rappels en attente
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{reminderStats.pending}</div>
                    <p className="text-xs text-muted-foreground">
                      {reminderStats.today} pour aujourd'hui
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  File d'attente
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {queueLoading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{queueStats.waiting}</div>
                    <p className="text-xs text-muted-foreground">
                      Patients en attente
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Urgences
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {queueLoading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{queueStats.urgent}</div>
                    <p className="text-xs text-muted-foreground">
                      Cas urgents
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="notifications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="reminders">Rappels</TabsTrigger>
              <TabsTrigger value="queue">File d'attente</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications">
              <NotificationCenter />
            </TabsContent>
            
            <TabsContent value="reminders">
              <ReminderSystem />
            </TabsContent>
            
            <TabsContent value="queue">
              <WaitingQueue />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
