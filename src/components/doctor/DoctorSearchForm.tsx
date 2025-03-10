
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ListFilter } from "lucide-react";

interface DoctorSearchFormProps {
  searchTerm: string;
  location: string;
  showFilters: boolean;
  onSearchTermChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
  onToggleFilters: () => void;
}

const DoctorSearchForm: React.FC<DoctorSearchFormProps> = ({
  searchTerm,
  location,
  showFilters,
  onSearchTermChange,
  onLocationChange,
  onSearch,
  onToggleFilters
}) => {
  return (
    <div className="mb-8">
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <Input
            placeholder="Spécialité ou nom du médecin"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px] relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <MapPin className="w-4 h-4" />
          </div>
          <Input
            placeholder="Localisation"
            className="pl-9"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
        <Button 
          className="flex gap-2" 
          onClick={onSearch}
        >
          <Search className="w-4 h-4" />
          Rechercher
        </Button>
        <Button 
          variant="outline" 
          className="flex gap-2" 
          onClick={onToggleFilters}
        >
          <ListFilter className="w-4 h-4" />
          Filtres
        </Button>
      </div>
    </div>
  );
};

export default DoctorSearchForm;
