import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Card className="bg-card border-border shadow-card mb-8">
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            BalatroBench
          </h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            className={`hover:bg-muted/50 ${isActive('/') ? 'bg-muted/50' : ''}`}
            asChild
          >
            <Link to="/">Benchmark</Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`hover:bg-muted/50 ${isActive('/community') ? 'bg-muted/50' : ''}`}
            asChild
          >
            <Link to="/community">Community</Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            className="bg-primary hover:bg-primary/90"
            asChild
          >
            <Link to="/submit">Submit Run</Link>
          </Button>
        </div>
      </nav>
    </Card>
  );
};

export default Navigation;