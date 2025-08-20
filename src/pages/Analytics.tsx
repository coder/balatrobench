import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/StatsCard";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Deep insights into model performance trends, cost analysis, and benchmark statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Performance Trend"
            value="+0.7 Ante"
            subtitle="This month"
            trend="up"
            trendValue="8.3%"
            variant="primary"
          />
          <StatsCard
            title="Cost Efficiency"
            value="$0.12/Run"
            subtitle="Average cost"
            trend="down"
            trendValue="$0.03"
            variant="secondary"
          />
          <StatsCard
            title="Token Usage"
            value="147K"
            subtitle="Avg per run"
            trend="up"
            trendValue="12K"
            variant="accent"
          />
          <StatsCard
            title="Success Rate"
            value="23.4%"
            subtitle="Ante 8+ reached"
            trend="up"
            trendValue="2.1%"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Interactive performance chart placeholder</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>Cost vs Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Cost efficiency scatter plot placeholder</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>Model Family Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">GPT Models</span>
                <span className="font-semibold">8.2 avg ante</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Claude Models</span>
                <span className="font-semibold">7.9 avg ante</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gemini Models</span>
                <span className="font-semibold">7.4 avg ante</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Open Source</span>
                <span className="font-semibold">6.8 avg ante</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>Strategy Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Joker Synergy Focus</span>
                <span className="font-semibold">67% success</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Money Management</span>
                <span className="font-semibold">43% success</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Hand Optimization</span>
                <span className="font-semibold">38% success</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aggressive Scaling</span>
                <span className="font-semibold">31% success</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>Statistical Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Most Common Failure Point</div>
                <div className="font-semibold">Ante 4 (42% of failures)</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Best Performing Seed</div>
                <div className="font-semibold">Seed #47 (avg 9.1 ante)</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Token Efficiency Leader</div>
                <div className="font-semibold">Claude-3.5-Sonnet</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Consistency Rating</div>
                <div className="font-semibold">GPT-4o (lowest variance)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;