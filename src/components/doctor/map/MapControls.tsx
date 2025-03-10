
import React from 'react';
import { Button } from '@/components/ui/button';
import { Locate, Layers, Map as MapIcon } from 'lucide-react';

interface MapControlsProps {
  onGetUserLocation: () => void;
  onToggleMapView: () => void;
  mapView: 'standard' | 'satellite';
  doctorCount: number;
}

const MapControls: React.FC<MapControlsProps> = ({
  onGetUserLocation,
  onToggleMapView,
  mapView,
  doctorCount
}) => {
  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button 
          onClick={onGetUserLocation}
          size="sm"
          className="flex items-center gap-2 bg-white text-primary hover:bg-gray-100"
          variant="outline"
        >
          <Locate className="w-4 h-4" />
          Ma position
        </Button>
        
        <Button 
          onClick={onToggleMapView}
          size="sm"
          className="flex items-center gap-2 bg-white text-primary hover:bg-gray-100"
          variant="outline"
        >
          <Layers className="w-4 h-4" />
          {mapView === 'standard' ? 'Vue satellite' : 'Vue standard'}
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 bg-white px-3 py-2 rounded-md shadow-sm flex items-center gap-2">
        <MapIcon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {doctorCount} médecins trouvés
        </span>
      </div>
    </>
  );
};

export default MapControls;
