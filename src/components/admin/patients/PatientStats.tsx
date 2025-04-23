
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserMinus, Calendar } from "lucide-react";

export const PatientStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-bold">247</p>
          </div>
          <Users className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Patients Actifs</p>
            <p className="text-2xl font-bold">189</p>
          </div>
          <UserCheck className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Patients Inactifs</p>
            <p className="text-2xl font-bold">58</p>
          </div>
          <UserMinus className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nouveaux (30j)</p>
            <p className="text-2xl font-bold">24</p>
          </div>
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
};
