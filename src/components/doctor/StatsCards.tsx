
import {
  Calendar,
  AlertCircle,
  MessageCircle,
  ChartBar,
  Percent,
  FileText
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Consultations aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary mr-2" />
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-gray-500">3 en téléconsultation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            En attente de confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-gray-500">À confirmer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Messages non lus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-gray-500">À traiter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Consultations ce mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ChartBar className="h-8 w-8 text-green-600 mr-2" />
            <div>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs text-gray-500">+12% depuis le mois dernier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Taux d'annulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Percent className="h-8 w-8 text-red-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">8.5%</p>
              <p className="text-xs text-gray-500">-2% depuis le mois dernier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Motif principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500 mr-2" />
            <div>
              <p className="text-xl font-bold">Renouvellement</p>
              <p className="text-xs text-gray-500">32% des consultations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
