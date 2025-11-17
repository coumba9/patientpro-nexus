import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AdvancedFilters {
  dateFrom?: string;
  dateTo?: string;
  doctorName?: string;
  specialty?: string;
  appointmentType?: string;
  consultationMode?: string;
}

interface AdvancedAppointmentFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  specialties?: Array<{ id: string; name: string }>;
}

export const AdvancedAppointmentFilters = ({
  filters,
  onFiltersChange,
  specialties = [],
}: AdvancedAppointmentFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: AdvancedFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres avancés
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtres avancés</SheetTitle>
          <SheetDescription>
            Affinez votre recherche de rendez-vous
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label>Date de début</Label>
            <Input
              type="date"
              value={localFilters.dateFrom || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, dateFrom: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Date de fin</Label>
            <Input
              type="date"
              value={localFilters.dateTo || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, dateTo: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Nom du médecin</Label>
            <Input
              placeholder="Rechercher un médecin..."
              value={localFilters.doctorName || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, doctorName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Spécialité</Label>
            <Select
              value={localFilters.specialty || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, specialty: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Type de rendez-vous</Label>
            <Select
              value={localFilters.appointmentType || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, appointmentType: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="followup">Suivi</SelectItem>
                <SelectItem value="urgent">Urgence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mode de consultation</Label>
            <Select
              value={localFilters.consultationMode || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, consultationMode: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modes</SelectItem>
                <SelectItem value="in_person">Présentiel</SelectItem>
                <SelectItem value="teleconsultation">Téléconsultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Appliquer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
