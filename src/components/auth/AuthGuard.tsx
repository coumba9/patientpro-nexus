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
      
      // Don't redirect if already on a valid page
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
    }
  }, [user, userRole, loading, navigate]);

  return <>{children}</>;
};