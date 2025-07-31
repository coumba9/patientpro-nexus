import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) => {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(redirectTo);
        return;
      }

      if (requiredRole.length > 0 && userRole && !requiredRole.includes(userRole)) {
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'doctor':
            navigate('/doctor');
            break;
          default:
            navigate('/patient');
        }
        return;
      }
    }
  }, [user, loading, userRole, navigate, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole.length > 0 && userRole && !requiredRole.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
};