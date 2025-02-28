
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // "patient", "doctor" ou "admin"
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler une connexion réussie
    console.log("Login attempt:", { email, password, role });
    if (email && password) {
      // Supprimer d'abord tout état de connexion existant
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      
      // Définir explicitement isLoggedIn à "true" (en tant que chaîne)
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);
      
      // Vérifier immédiatement que les valeurs ont été correctement définies
      console.log("After login, isLoggedIn:", localStorage.getItem("isLoggedIn"));
      console.log("After login, userRole:", localStorage.getItem("userRole"));
      
      toast.success("Connexion réussie");
      
      // Rediriger vers le tableau de bord correspondant
      switch (role) {
        case "patient":
          navigate("/patient");
          break;
        case "doctor":
          navigate("/doctor");
          break;
        case "admin":
          navigate("/admin");
          break;
      }
    } else {
      toast.error("Veuillez remplir tous les champs");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link to="/register" className="text-primary hover:text-primary/90">
              créez un compte
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === "patient"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Patient
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === "doctor"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Médecin
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Administrateur
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary/90"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
