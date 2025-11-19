
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  TrendingUp,
  Calendar,
  User,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Skeleton } from "@/components/ui/skeleton";

const AdminAnalytics = () => {
  const { data, loading: analyticsLoading } = useAdminAnalytics();
  const { stats, loading: statsLoading } = useAdminStats();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <h2 className="font-semibold text-lg mb-4">Administration</h2>
            <Link to="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Utilisateurs
              </Button>
            </Link>
            <Link to="/admin/moderation">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Modération
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <BarChart className="mr-2 h-5 w-5" />
                Statistiques
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* KPI Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Total Utilisateurs</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Tous les profils</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Consultations</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.completedAppointments}</p>
                  <p className="text-sm text-muted-foreground">Terminées</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Total RDV</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.totalAppointments}</p>
                  <p className="text-sm text-muted-foreground">Tous statuts</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">En Attente</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stats.pendingAppointments}</p>
                  <p className="text-sm text-muted-foreground">À confirmer</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Évolution des activités</h3>
              {analyticsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" name="Nouveaux utilisateurs" />
                    <Line type="monotone" dataKey="consultations" stroke="#82ca9d" name="Consultations" />
                    <Line type="monotone" dataKey="appointments" stroke="#ffc658" name="Rendez-vous" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3">Résumé des activités</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Rendez-vous confirmés</span>
                    <span className="font-semibold">{stats.totalAppointments - stats.pendingAppointments - stats.cancelledAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rendez-vous en attente</span>
                    <span className="font-semibold">{stats.pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rendez-vous annulés</span>
                    <span className="font-semibold">{stats.cancelledAppointments}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3">Statistiques des médecins</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Médecins vérifiés</span>
                    <span className="font-semibold">{stats.verifiedDoctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Applications en attente</span>
                    <span className="font-semibold">{stats.pendingDoctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total médecins</span>
                    <span className="font-semibold">{stats.totalDoctors}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
