
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

const data = [
  { name: "Jan", users: 400, consultations: 240 },
  { name: "Fév", users: 300, consultations: 139 },
  { name: "Mar", users: 200, consultations: 980 },
  { name: "Avr", users: 278, consultations: 390 },
  { name: "Mai", users: 189, consultations: 480 },
  { name: "Jun", users: 239, consultations: 380 },
];

const AdminAnalytics = () => {
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Total Utilisateurs</h3>
                </div>
                <p className="text-2xl font-bold mt-2">1,234</p>
                <p className="text-sm text-green-600">+12% ce mois</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Téléconsultations</h3>
                </div>
                <p className="text-2xl font-bold mt-2">856</p>
                <p className="text-sm text-green-600">+8% ce mois</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold">RDV ce mois</h3>
                </div>
                <p className="text-2xl font-bold mt-2">342</p>
                <p className="text-sm text-green-600">+15% ce mois</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Taux de satisfaction</h3>
                </div>
                <p className="text-2xl font-bold mt-2">95%</p>
                <p className="text-sm text-green-600">+2% ce mois</p>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Évolution sur 6 mois</h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      name="Utilisateurs"
                    />
                    <Line
                      type="monotone"
                      dataKey="consultations"
                      stroke="#82ca9d"
                      name="Consultations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
