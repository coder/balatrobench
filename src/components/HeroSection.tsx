import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  return (
    <div className="text-center mb-12">
      <div className="mb-6">
        <Badge variant="outline" className="border-primary/30 text-primary mb-4">
          🎯 Benchmark Platform
        </Badge>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          BalatroLLM
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Evaluating Large Language Models' strategic performance in the roguelike card game Balatro through intelligent tool-calling and decision-making benchmarks.
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <Button size="lg" className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground">
          View Leaderboard
        </Button>
        <Button size="lg" variant="outline" className="border-border/40 hover:shadow-glow-secondary">
          Browse Models
        </Button>
      </div>

      <Card className="bg-gradient-card border-border/20 shadow-elevation p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">47</div>
            <div className="text-muted-foreground">Models Evaluated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">12.4k</div>
            <div className="text-muted-foreground">Total Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">89.2%</div>
            <div className="text-muted-foreground">Reproducibility Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeroSection;