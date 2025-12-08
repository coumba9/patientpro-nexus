
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Home, Heart, Shield, Clock, Stethoscope } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Connexion réussie");
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Veuillez confirmer votre email avant de vous connecter");
      } else {
        toast.error("Erreur de connexion. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Heart, text: "Suivi médical personnalisé" },
    { icon: Shield, text: "Données sécurisées" },
    { icon: Clock, text: "Rendez-vous en quelques clics" },
    { icon: Stethoscope, text: "Médecins qualifiés" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          {/* Large circle top right */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          
          {/* Medium circle bottom left */}
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          
          {/* Small floating circles */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white/20 rounded-full animate-float" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/15 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-white/10 rounded-full animate-float" style={{ animationDelay: "2s" }} />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full" style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }} />
          </div>
          
          {/* Medical cross patterns */}
          <div className="absolute top-20 right-20 opacity-10">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
              <rect x="35" y="10" width="30" height="80" rx="5" />
              <rect x="10" y="35" width="80" height="30" rx="5" />
            </svg>
          </div>
          <div className="absolute bottom-40 left-20 opacity-10 scale-75">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
              <rect x="35" y="10" width="30" height="80" rx="5" />
              <rect x="10" y="35" width="80" height="30" rx="5" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-8">
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Bienvenue sur<br />
              <span className="text-white/90">JàmmSanté</span>
            </h1>
            <p className="text-lg xl:text-xl text-white/80 max-w-md">
              Votre plateforme de santé digitale pour un accès simplifié aux soins médicaux
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mt-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 text-white/90 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-white/70 text-sm">Médecins</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-white/70 text-sm">Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50k+</div>
              <div className="text-white/70 text-sm">Consultations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 bg-background relative">
        {/* Mobile decorative elements */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="lg:hidden absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="lg:hidden absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Home button */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">JàmmSanté</h1>
            <p className="text-muted-foreground text-sm mt-1">Votre santé, notre priorité</p>
          </div>

          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
              <CardDescription className="text-center">
                Entrez vos identifiants pour accéder à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Cacher" : "Afficher"} le mot de passe
                      </span>
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-3 pt-2">
              <Link 
                to="/reset-password" 
                className="text-sm text-primary hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>
              <div className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  S'inscrire
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-4 w-4" />
              <span>SSL Sécurisé</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs">
              <Heart className="h-4 w-4" />
              <span>RGPD Conforme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
