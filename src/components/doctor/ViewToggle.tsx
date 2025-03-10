
import React from 'react';
import { Button } from "@/components/ui/button";
import { LayoutGrid, MapIcon } from "lucide-react";

interface ViewToggleProps {
  viewMode: "list" | "map";
  onViewModeChange: (mode: "list" | "map") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="mt-4 flex justify-end">
      <div className="bg-white rounded-lg shadow-sm inline-flex">
        <Button 
          variant={viewMode === "list" ? "default" : "ghost"}
          className="flex items-center gap-2 rounded-r-none"
          onClick={() => onViewModeChange("list")}
        >
          <LayoutGrid className="h-4 w-4" />
          Liste
        </Button>
        <Button 
          variant={viewMode === "map" ? "default" : "ghost"}
          className="flex items-center gap-2 rounded-l-none"
          onClick={() => onViewModeChange("map")}
        >
          <MapIcon className="h-4 w-4" />
          Carte
        </Button>
      </div>
    </div>
  );
};

export default ViewToggle;
