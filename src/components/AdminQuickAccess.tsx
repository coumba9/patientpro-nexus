
import { Link } from "react-router-dom";
import { User, Users, BarChart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminQuickAccess = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Accès Administration</CardTitle>
        <CardDescription>
          Accédez rapidement aux fonctionnalités d'administration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/patients">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <User className="h-6 w-6" />
              <span>Gestion des Patients</span>
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>Gestion des Utilisateurs</span>
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <BarChart className="h-6 w-6" />
              <span>Statistiques</span>
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Paramètres</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
