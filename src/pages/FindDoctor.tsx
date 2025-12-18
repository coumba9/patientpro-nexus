import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map, List } from "lucide-react";
import { motion } from "framer-motion";
import DoctorMap from "@/components/doctor/DoctorMap";
import DoctorList from "@/components/doctor/DoctorList";
import DoctorSearchForm from "@/components/doctor/DoctorSearchForm";
import DoctorFilters, { FilterState } from "@/components/doctor/DoctorFilters";
import { DoctorProvider, useDoctorContext, Doctor } from "@/contexts/DoctorContext";
import { useAuth } from "@/hooks/useAuth";

const defaultFilters: FilterState = {
  availability: 'all',
  minRating: 0,
  teleconsultation: false,
  verifiedOnly: false,
  radius: 50,
};

const FindDoctorContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const isLoggedIn = !!user;
  
  const { 
    filteredDoctors, 
    selectedRadius,
    userLocation,
    searchTerm,
    location,
    setSearchTerm,
    setLocation,
    setSelectedRadius,
    handleSearch
  } = useDoctorContext();

  // Initialize search from URL params
  useState(() => {
    const specialty = searchParams.get('specialty');
    const q = searchParams.get('q');
    if (specialty) setSearchTerm(specialty);
    if (q) setSearchTerm(q);
  });

  // Apply advanced filters
  const advancedFilteredDoctors = useMemo(() => {
    return filteredDoctors.filter(doctor => {
      // Rating filter
      if (filters.minRating > 0 && doctor.rating < filters.minRating) {
        return false;
      }
      
      // Verified only filter
      if (filters.verifiedOnly && !doctor.is_verified) {
        return false;
      }
      
      // Availability filter (mock logic - in real app, check actual schedule)
      if (filters.availability !== 'all') {
        const availLower = doctor.availability.toLowerCase();
        switch (filters.availability) {
          case 'today':
            if (!availLower.includes("aujourd'hui")) return false;
            break;
          case 'tomorrow':
            if (!availLower.includes('demain')) return false;
            break;
          case 'this_week':
            if (!availLower.includes('semaine') && !availLower.includes("aujourd'hui") && !availLower.includes('demain')) return false;
            break;
        }
      }
      
      return true;
    });
  }, [filteredDoctors, filters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.availability !== 'all') count++;
    if (filters.minRating > 0) count++;
    if (filters.teleconsultation) count++;
    if (filters.verifiedOnly) count++;
    if (filters.radius !== 50) count++;
    return count;
  }, [filters]);

  // Handle selecting a doctor on the map
  const handleDoctorSelect = (doctorId: string) => {
    const selectedDoctor = advancedFilteredDoctors.find(d => d.id === doctorId);
    if (selectedDoctor) {
      handleBooking(selectedDoctor);
    }
  };

  // Handle booking a doctor appointment
  const handleBooking = (doctor: Doctor) => {
    if (!isLoggedIn) {
      toast.info("Vous allez être redirigé vers la page de réservation. Vous pourrez vous connecter par la suite.");
    }
    
    navigate(`/book-appointment?doctorId=${encodeURIComponent(doctor.id)}&doctor=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Update filters with radius sync
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.radius !== selectedRadius) {
      setSelectedRadius(newFilters.radius);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Trouver un médecin</h1>
                <p className="text-sm text-muted-foreground">
                  {advancedFilteredDoctors.length} praticien{advancedFilteredDoctors.length !== 1 ? 's' : ''} disponible{advancedFilteredDoctors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Map className="w-4 h-4" />
                Carte
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search Form */}
        <DoctorSearchForm 
          searchTerm={searchTerm}
          location={location}
          showFilters={showFilters}
          activeFiltersCount={activeFiltersCount}
          onSearchTermChange={setSearchTerm}
          onLocationChange={setLocation}
          onSearch={handleSearch}
          onToggleFilters={toggleFilters}
        />
        
        {/* Advanced Filters */}
        <DoctorFilters 
          showFilters={showFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          resultCount={advancedFilteredDoctors.length}
        />

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")}>
            <TabsContent value="list" className="m-0">
              <DoctorList 
                doctors={advancedFilteredDoctors} 
                onBooking={handleBooking} 
              />
            </TabsContent>
            
            <TabsContent value="map" className="m-0">
              <div className="rounded-2xl overflow-hidden border border-border/50">
                <DoctorMap 
                  doctors={advancedFilteredDoctors}
                  onDoctorSelect={handleDoctorSelect}
                  selectedRadius={filters.radius}
                  userLocation={userLocation}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {advancedFilteredDoctors.length} médecin{advancedFilteredDoctors.length !== 1 ? 's' : ''} trouvé{advancedFilteredDoctors.length !== 1 ? 's' : ''}. Cliquez sur un marqueur pour voir les détails.
              </p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

const FindDoctor = () => {
  return (
    <DoctorProvider>
      <FindDoctorContent />
    </DoctorProvider>
  );
};

export default FindDoctor;
