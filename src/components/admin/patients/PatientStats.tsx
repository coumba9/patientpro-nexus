
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserMinus, Calendar } from "lucide-react";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import { Skeleton } from "@/components/ui/skeleton";

export const PatientStats = () => {
  const { stats, loading } = useAdminPatients();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <Users className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Patients Actifs</p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </div>
          <UserCheck className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Patients Inactifs</p>
            <p className="text-2xl font-bold">{stats.inactive}</p>
          </div>
          <UserMinus className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nouveaux (30j)</p>
            <p className="text-2xl font-bold">{stats.newThisMonth}</p>
          </div>
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
};
