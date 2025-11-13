
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn, UserPlus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";

interface MobileNavigationProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

export const MobileNavigation = ({ isLoggedIn, userRole }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] py-6">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" onClick={closeMenu} className="text-2xl font-bold text-primary">
              JàmmSanté
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex flex-col gap-4">
            <Link 
              to="/" 
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-accent"
            >
              <Home size={20} />
              Accueil
            </Link>
            
            <Link 
              to="/find-doctor" 
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-accent"
            >
              Trouver un médecin
            </Link>

            <Link 
              to="/how-it-works" 
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-accent"
            >
              Comment ça marche
            </Link>
            
            <Link 
              to="/about" 
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-accent"
            >
              À propos
            </Link>

            <Link 
              to="/contact" 
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-accent"
            >
              Contact
            </Link>
          </nav>
          
          <div className="mt-auto border-t pt-5 space-y-3">
            {!isLoggedIn ? (
              <>
                <Link to="/login" onClick={closeMenu} className="w-full">
                  <Button className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    S'inscrire
                  </Button>
                </Link>
              </>
            ) : (
              <div className="space-y-3">
                {userRole === "patient" && (
                  <Link to="/patient" onClick={closeMenu} className="w-full">
                    <Button className="w-full">Mon espace patient</Button>
                  </Link>
                )}
                
                {userRole === "doctor" && (
                  <Link to="/doctor" onClick={closeMenu} className="w-full">
                    <Button className="w-full">Mon espace médecin</Button>
                  </Link>
                )}
                
                {userRole === "admin" && (
                  <Link to="/admin" onClick={closeMenu} className="w-full">
                    <Button className="w-full">Administration</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
