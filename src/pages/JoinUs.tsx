import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const JoinUs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to doctor registration page
    navigate("/register?type=doctor", { replace: true });
  }, [navigate]);

  return null;
};

export default JoinUs;
