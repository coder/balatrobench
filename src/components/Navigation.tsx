import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Navigation = () => {
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
          <Button variant="ghost" className="hover:bg-muted/50">
            Dashboard
          </Button>
          <Button variant="ghost" className="hover:bg-muted/50">
            Official Benchmark
          </Button>
          <Button variant="ghost" className="hover:bg-muted/50">
            Community
          </Button>
          <Button variant="ghost" className="hover:bg-muted/50">
            Analytics
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-border/40 hover:shadow-glow-primary">
            API Access
          </Button>
          <Button className="bg-gradient-primary hover:shadow-glow-primary">
            Submit Run
          </Button>
        </div>
      </nav>
    </Card>
  );
};

export default Navigation;