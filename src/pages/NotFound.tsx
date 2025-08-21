import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-primary mx-auto mb-6">
          <span className="text-primary-foreground font-bold text-2xl">404</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-6">The benchmark data you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:shadow-glow-primary transition-all duration-300"
        >
          Return to BalatroBench
        </a>
      </div>
    </div>
  );
};

export default NotFound;
