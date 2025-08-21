import Navigation from "@/components/Navigation";
import Leaderboard from "@/components/Leaderboard";
import StatsCard from "@/components/StatsCard";

const OfficialBenchmark = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            BalatroBench
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Community-driven benchmark platform for evaluating Large Language Models' strategic performance in Balatro through intelligent tool-calling and decision-making.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Benchmark Version"
            value="v2.1.3"
            subtitle="Latest stable"
            variant="primary"
          />
          <StatsCard
            title="Total Runs"
            value="1,247"
            subtitle="Across all models"
            trend="up"
            trendValue="23"
          />
          <StatsCard
            title="Seeds Used"
            value="100"
            subtitle="For reproducibility"
          />
          <StatsCard
            title="Avg Runtime"
            value="12.3 min"
            subtitle="Per benchmark run"
            trend="down"
            trendValue="0.8"
            variant="accent"
          />
        </div>

        <Leaderboard />

        <div className="mt-12 bg-gradient-card rounded-xl p-8 border border-border/20">
          <h2 className="text-2xl font-bold mb-4">Methodology</h2>
          <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Game Parameters</h3>
              <ul className="space-y-1 text-sm">
                <li>• Balatro v1.0.1n</li>
                <li>• 100 consistent seeds</li>
                <li>• Standard deck configuration</li>
                <li>• No modifications or cheats</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Evaluation Criteria</h3>
              <ul className="space-y-1 text-sm">
                <li>• Average ante reached</li>
                <li>• Win rate across seeds</li>
                <li>• Token efficiency</li>
                <li>• Decision quality scoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialBenchmark;