import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Card className="bg-gradient-card border-border/20 shadow-card mb-8">
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-primary">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            BalatroLLM
          </h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            className={`hover:bg-muted/50 ${isActive('/') ? 'bg-muted/50' : ''}`}
            asChild
          >
            <Link to="/">Dashboard</Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`hover:bg-muted/50 ${isActive('/benchmark') ? 'bg-muted/50' : ''}`}
            asChild
          >
            <Link to="/benchmark">Official Benchmark</Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`hover:bg-muted/50 ${isActive('/community') ? 'bg-muted/50' : ''}`}
            asChild
          >
            <Link to="/community">Community</Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`hover:bg-muted/50 ${isActive('/analytics') ? 'bg-muted/50' : ''}`}
            asChild
          >
            <Link to="/analytics">Analytics</Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="border-border/40 hover:shadow-glow-primary"
            asChild
          >
            <Link to="/api">API Access</Link>
          </Button>
          <Button 
            className="bg-gradient-primary hover:shadow-glow-primary"
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