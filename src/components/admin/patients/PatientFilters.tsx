
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export const PatientFilters = () => {
  return (
    <div className="flex items-center space-x-2">
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Filtrer par statut" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les patients</SelectItem>
          <SelectItem value="active">Patients actifs</SelectItem>
          <SelectItem value="inactive">Patients inactifs</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nom</SelectItem>
          <SelectItem value="lastVisit">Dernière visite</SelectItem>
          <SelectItem value="appointments">Nombre de RDV</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
