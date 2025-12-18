import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  Video, 
  Clock, 
  MapPin, 
  Shield, 
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';

export interface FilterState {
  availability: 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week';
  minRating: number;
  teleconsultation: boolean;
  verifiedOnly: boolean;
  radius: number;
}

interface DoctorFiltersProps {
  showFilters: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

const availabilityOptions = [
  { value: 'all', label: 'Toutes disponibilités' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'tomorrow', label: 'Demain' },
  { value: 'this_week', label: 'Cette semaine' },
  { value: 'next_week', label: 'Semaine prochaine' },
];

const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  showFilters,
  filters,
  onFilterChange,
  onReset,
  resultCount
}) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.availability !== 'all' || 
    filters.minRating > 0 || 
    filters.teleconsultation || 
    filters.verifiedOnly ||
    filters.radius !== 50;

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-4 bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">Filtres avancés</h3>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-xs">
                    Filtres actifs
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Availability Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  Disponibilité
                </div>
                <div className="flex flex-wrap gap-2">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('availability', option.value as FilterState['availability'])}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                        filters.availability === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Note minimum
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => updateFilter('minRating', rating)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all ${
                          filters.minRating === rating
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {rating === 0 ? 'Tous' : (
                          <>
                            {rating}
                            <Star className="w-3 h-3 fill-current" />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Radius Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Rayon de recherche
                  </div>
                  <span className="text-primary font-semibold">{filters.radius} km</span>
                </div>
                <Slider
                  value={[filters.radius]}
                  onValueChange={(value) => updateFilter('radius', value[0])}
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="teleconsult" className="text-sm font-medium cursor-pointer">
                      Téléconsultation
                    </Label>
                  </div>
                  <Switch
                    id="teleconsult"
                    checked={filters.teleconsultation}
                    onCheckedChange={(checked) => updateFilter('teleconsultation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <Label htmlFor="verified" className="text-sm font-medium cursor-pointer">
                      Médecins vérifiés uniquement
                    </Label>
                  </div>
                  <Switch
                    id="verified"
                    checked={filters.verifiedOnly}
                    onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{resultCount}</span> médecin{resultCount !== 1 ? 's' : ''} correspond{resultCount !== 1 ? 'ent' : ''} à vos critères
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoctorFilters;
