
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  UserCheck, 
  Calendar, 
  TrendingUp 
} from "lucide-react";

const SpecialtyStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spécialités
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">
            +3 depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Médecins Spécialistes
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">76</div>
          <p className="text-xs text-muted-foreground">
            +8 depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Rendez-vous par Spécialité
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">187</div>
          <p className="text-xs text-muted-foreground">
            +32 depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Spécialité en Croissance
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Cardiologie</div>
          <p className="text-xs text-muted-foreground">
            +45% de rendez-vous ce mois
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialtyStats;
