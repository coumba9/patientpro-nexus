
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ProximityFilterProps {
  radius: number;
  onChange: (value: number) => void;
}

const ProximityFilter: React.FC<ProximityFilterProps> = ({ radius, onChange }) => {
  const handleRadiusChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="mb-4">
        <Label htmlFor="radius-filter" className="text-sm font-medium mb-2 block">
          Distance maximale : {radius} km
        </Label>
        <Slider
          id="radius-filter"
          defaultValue={[radius]}
          max={50}
          min={1}
          step={1}
          onValueChange={handleRadiusChange}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1 km</span>
        <span>25 km</span>
        <span>50 km</span>
      </div>
    </div>
  );
};

export default ProximityFilter;
