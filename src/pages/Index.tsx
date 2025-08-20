import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsCard from "@/components/StatsCard";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <HeroSection />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Top Model Performance"
            value="8.4 Ante"
            subtitle="GPT-4o average"
            trend="up"
            trendValue="0.3"
            variant="primary"
          />
          <StatsCard
            title="Best Win Rate"
            value="23.1%"
            subtitle="Across all models"
            trend="up"
            trendValue="1.2%"
            variant="secondary"
          />
          <StatsCard
            title="Token Efficiency"
            value="2.3 T/A"
            subtitle="Tokens per ante"
            trend="down"
            trendValue="0.1"
            variant="accent"
          />
          <StatsCard
            title="Active Models"
            value="47"
            subtitle="Currently benchmarked"
            trend="up"
            trendValue="3"
          />
        </div>

        <Leaderboard />
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            BalatroLLM uses standardized prompts and reproducible seeds to ensure fair model comparisons. 
            <br />
            All benchmarks are run on the latest Balatro version with consistent game parameters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;