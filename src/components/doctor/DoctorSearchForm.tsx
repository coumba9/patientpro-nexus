import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

interface DoctorSearchFormProps {
  searchTerm: string;
  location: string;
  showFilters: boolean;
  activeFiltersCount: number;
  onSearchTermChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
  onToggleFilters: () => void;
}

const DoctorSearchForm: React.FC<DoctorSearchFormProps> = ({
  searchTerm,
  location,
  showFilters,
  activeFiltersCount,
  onSearchTermChange,
  onLocationChange,
  onSearch,
  onToggleFilters
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Specialty/Name Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Spécialité, nom du médecin..."
              className="pl-12 pr-4 py-6 text-base border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchTermChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border my-2" />

          {/* Location Search */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ville, quartier..."
              className="pl-12 pr-4 py-6 text-base border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {location && (
              <button
                onClick={() => onLocationChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={onSearch}
              size="lg"
              className="py-6 px-8 rounded-xl bg-gradient-primary shadow-sm hover:shadow-md transition-shadow"
            >
              <Search className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Rechercher</span>
            </Button>
            
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="lg"
              onClick={onToggleFilters}
              className={`py-6 px-4 rounded-xl relative ${showFilters ? 'bg-primary/10 border-primary/30' : ''}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2 self-center">Recherches rapides :</span>
        {['Médecin généraliste', 'Dentiste', 'Ophtalmologue', 'Pédiatre', 'Dermatologue'].map((specialty) => (
          <button
            key={specialty}
            onClick={() => {
              onSearchTermChange(specialty);
              onSearch();
            }}
            className={`px-4 py-2 text-sm rounded-full transition-all ${
              searchTerm === specialty
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {specialty}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DoctorSearchForm;
