import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate("/login");
    }
  }, [user, loading, requireAuth, navigate]);

  useEffect(() => {
    if (!loading && user && userRole) {
      // Auto-redirect authenticated users to their dashboard
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on a valid page for the user's role
      if (currentPath === '/login' || currentPath === '/register') {
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'doctor':
            navigate('/doctor');
            break;
          case 'patient':
            navigate('/patient');
            break;
        }
      }
      
      // Si l'utilisateur est sur admin mais n'est pas admin, rediriger
      if (currentPath.startsWith('/admin') && userRole !== 'admin') {
        switch (userRole) {
          case 'doctor':
            navigate('/doctor');
            break;
          case 'patient':
            navigate('/patient');
            break;
          default:
            navigate('/');
        }
      }
      
      // Si l'utilisateur est sur patient mais n'est pas patient, rediriger
      if (currentPath.startsWith('/patient') && userRole !== 'patient') {
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'doctor':
            navigate('/doctor');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  return <>{children}</>;
};