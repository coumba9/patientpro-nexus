
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DoctorInfo {
  name: string;
  specialty: string;
  fees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  languages: string[];
  experience: string;
  education: string;
  conventions: string;
}

interface DoctorInfoCardProps {
  doctorInfo: DoctorInfo;
}

export const DoctorInfoCard = ({ doctorInfo }: DoctorInfoCardProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du médecin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{doctorInfo.name}</h3>
            <p className="text-gray-600">{doctorInfo.specialty}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Expérience</p>
            <p className="text-gray-600">{doctorInfo.experience}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Formation</p>
            <p className="text-gray-600">{doctorInfo.education}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Langues parlées</p>
            <p className="text-gray-600">{doctorInfo.languages.join(", ")}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Convention</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-600">{doctorInfo.conventions}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Les tarifs sont conventionnés avec la sécurité sociale</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tarifs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Tarif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Consultation</TableCell>
                <TableCell className="text-right">{doctorInfo.fees.consultation}€</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Suivi</TableCell>
                <TableCell className="text-right">{doctorInfo.fees.followup}€</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Urgence</TableCell>
                <TableCell className="text-right">{doctorInfo.fees.urgent}€</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
