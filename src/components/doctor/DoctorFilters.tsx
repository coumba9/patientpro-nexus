
import React from 'react';
import ProximityFilter from '@/components/doctor/ProximityFilter';

interface DoctorFiltersProps {
  showFilters: boolean;
  selectedRadius: number;
  onRadiusChange: (value: number) => void;
}

const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  showFilters,
  selectedRadius,
  onRadiusChange
}) => {
  if (!showFilters) return null;
  
  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm animate-in fade-in-50 duration-300">
      <h3 className="font-medium mb-3">Filtres avancés</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProximityFilter 
          radius={selectedRadius} 
          onChange={onRadiusChange} 
        />
        {/* Plus de filtres pourraient être ajoutés ici */}
      </div>
    </div>
  );
};

export default DoctorFilters;
