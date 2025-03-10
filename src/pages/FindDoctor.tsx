
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Home, ArrowLeft, ListFilter, MapIcon, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import DoctorMap from "@/components/doctor/DoctorMap";
import ProximityFilter from "@/components/doctor/ProximityFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

// Données de médecins enrichies avec des coordonnées fictives
const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Martin",
    specialty: "Cardiologue",
    location: "Paris",
    availability: "Disponible aujourd'hui",
    rating: 4.8,
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    id: 2,
    name: "Dr. Thomas Bernard",
    specialty: "Dermatologue",
    location: "Lyon",
    availability: "Disponible demain",
    rating: 4.9,
    latitude: 45.7640,
    longitude: 4.8357
  },
  {
    id: 3,
    name: "Dr. Marie Dubois",
    specialty: "Pédiatre",
    location: "Marseille",
    availability: "Disponible cette semaine",
    rating: 4.7,
    latitude: 43.2965,
    longitude: 5.3698
  },
  {
    id: 4,
    name: "Dr. Jean Petit",
    specialty: "Généraliste",
    location: "Toulouse",
    availability: "Disponible aujourd'hui",
    rating: 4.5,
    latitude: 43.6047,
    longitude: 1.4437
  },
  {
    id: 5,
    name: "Dr. Claire Moreau",
    specialty: "Ophtalmologue",
    location: "Nice",
    availability: "Disponible cette semaine",
    rating: 4.6,
    latitude: 43.7102,
    longitude: 7.2620
  },
  {
    id: 6,
    name: "Dr. Philippe Lambert",
    specialty: "Psychiatre",
    location: "Bordeaux",
    availability: "Disponible demain",
    rating: 4.9,
    latitude: 44.8378,
    longitude: -0.5792
  },
];

const FindDoctor = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockDoctors);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedRadius, setSelectedRadius] = useState(15); // Rayon par défaut de 15km
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Vérifier l'état de connexion au chargement du composant
  useEffect(() => {
    // Fonction de vérification
    const checkLoginStatus = () => {
      const status = localStorage.getItem("isLoggedIn") === "true";
      console.log("FindDoctor component - checking login status:", status);
      setIsLoggedIn(status);
    };
    
    // Vérifier immédiatement
    checkLoginStatus();
    
    // Configurer l'écouteur d'événements
    window.addEventListener('storage', checkLoginStatus);
    
    // Nettoyage
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Demander la géolocalisation de l'utilisateur au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          toast.success("Votre position a été détectée");
          
          // Filtrer les médecins par proximité
          filterDoctorsByProximity(latitude, longitude, selectedRadius);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          toast.error("Impossible de récupérer votre position");
        }
      );
    }
  }, []);

  // Filtrer les médecins par proximité
  const filterDoctorsByProximity = (lat: number, lng: number, radiusKm: number) => {
    // Fonction pour calculer la distance entre deux points (en km)
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Rayon de la Terre en km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const d = R * c; // Distance en km
      return d;
    };
    
    const deg2rad = (deg: number) => {
      return deg * (Math.PI/180);
    };
    
    // Filtrer les médecins dans le rayon spécifié
    const nearby = mockDoctors.filter(doctor => {
      if (!doctor.latitude || !doctor.longitude) return true; // Inclure par défaut si pas de coordonnées
      
      const distance = getDistanceFromLatLonInKm(
        lat, 
        lng, 
        doctor.latitude, 
        doctor.longitude
      );
      
      return distance <= radiusKm;
    });
    
    // Appliquer d'autres filtres si nécessaire
    applyAllFilters(nearby);
  };

  // Appliquer tous les filtres (recherche, lieu, proximité)
  const applyAllFilters = (doctors = mockDoctors) => {
    const filtered = doctors.filter(
      (doctor) =>
        (searchTerm === "" || 
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (location === "" || 
          doctor.location.toLowerCase().includes(location.toLowerCase()))
    );
    
    setFilteredDoctors(filtered);
  };

  // Fonction de recherche
  const handleSearch = () => {
    if (userLocation) {
      filterDoctorsByProximity(userLocation[1], userLocation[0], selectedRadius);
    } else {
      applyAllFilters();
    }
  };

  // Mettre à jour le rayon de recherche
  const handleRadiusChange = (newRadius: number) => {
    setSelectedRadius(newRadius);
    if (userLocation) {
      filterDoctorsByProximity(userLocation[1], userLocation[0], newRadius);
    }
  };

  // Sélectionner un médecin sur la carte
  const handleDoctorSelect = (doctorId: number) => {
    const selectedDoctor = mockDoctors.find(d => d.id === doctorId);
    if (selectedDoctor) {
      handleBooking(selectedDoctor);
    }
  };

  const handleBooking = (doctor: Doctor) => {
    // Vérifier si l'utilisateur est connecté, mais naviguer directement 
    // vers la page de réservation sans redirection forcée vers login
    if (!isLoggedIn) {
      // Informer l'utilisateur mais ne pas rediriger
      toast.info("Vous allez être redirigé vers la page de réservation. Vous pourrez vous connecter par la suite.");
    }
    
    // Naviguer directement vers la page de rendez-vous dans tous les cas
    navigate(`/book-appointment?doctor=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`);
  };

  // Basculer l'affichage des filtres
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Trouver un médecin</h1>
          
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Spécialité ou nom du médecin"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button 
              className="flex gap-2" 
              onClick={handleSearch}
            >
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
            <Button 
              variant="outline" 
              className="flex gap-2" 
              onClick={toggleFilters}
            >
              <ListFilter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm animate-in fade-in-50 duration-300">
              <h3 className="font-medium mb-3">Filtres avancés</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProximityFilter 
                  radius={selectedRadius} 
                  onChange={handleRadiusChange} 
                />
                {/* Plus de filtres pourraient être ajoutés ici */}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <div className="bg-white rounded-lg shadow-sm inline-flex">
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"}
                className="flex items-center gap-2 rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                <LayoutGrid className="h-4 w-4" />
                Liste
              </Button>
              <Button 
                variant={viewMode === "map" ? "default" : "ghost"}
                className="flex items-center gap-2 rounded-l-none"
                onClick={() => setViewMode("map")}
              >
                <MapIcon className="h-4 w-4" />
                Carte
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")} className="mb-8">
          <TabsContent value="list" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
                  <p className="text-gray-600 mb-1">{doctor.specialty}</p>
                  <p className="text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {doctor.location}
                  </p>
                  <p className="text-green-600 mb-4">{doctor.availability}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-yellow-500">★ {doctor.rating}</div>
                    <Button onClick={() => handleBooking(doctor)}>Prendre RDV</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="map" className="m-0">
            <div className="mb-4">
              <DoctorMap 
                doctors={filteredDoctors}
                onDoctorSelect={handleDoctorSelect}
                selectedRadius={selectedRadius}
                userLocation={userLocation}
              />
              <p className="text-sm text-gray-500 mt-2">
                {filteredDoctors.length} médecins trouvés. Cliquez sur un marqueur pour voir les détails.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FindDoctor;
