
import { useEffect } from "react";
import mermaid from "mermaid";

export const DiagramInitializer = () => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    });
    
    // Render all diagrams after component mounts
    setTimeout(() => {
      mermaid.contentLoaded();
    }, 100);
  }, []);

  return null;
};
