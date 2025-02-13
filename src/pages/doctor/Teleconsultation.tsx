
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoIcon, Users, Calendar, Settings } from "lucide-react";

const Teleconsultation = () => {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Téléconsultation</CardTitle>
          <CardDescription>Gérez vos consultations à distance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <VideoIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-500">Consultations prévues aujourd'hui</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-500">Consultations cette semaine</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-gray-500">Taux de satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Button size="lg" className="w-full md:w-auto">
                <VideoIcon className="mr-2 h-4 w-4" />
                Démarrer une nouvelle consultation
              </Button>
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres de téléconsultation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Teleconsultation;
