import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ApiAccess = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            API Access
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Integrate BalatroLLM benchmarking into your research workflow with our REST API.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Free Tier
                <Badge variant="outline">$0/month</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>• 10 benchmark runs/month</li>
                <li>• Access to results API</li>
                <li>• Community leaderboard data</li>
                <li>• Basic documentation</li>
              </ul>
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/20 shadow-card shadow-glow-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pro Tier
                <Badge className="bg-gradient-primary">$49/month</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>• 500 benchmark runs/month</li>
                <li>• Custom seed configuration</li>
                <li>• Detailed analytics API</li>
                <li>• Priority support</li>
                <li>• Webhook notifications</li>
              </ul>
              <Button className="w-full bg-gradient-primary hover:shadow-glow-primary">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Enterprise
                <Badge variant="secondary">Custom</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>• Unlimited benchmark runs</li>
                <li>• Private leaderboards</li>
                <li>• Custom evaluation metrics</li>
                <li>• Dedicated support</li>
                <li>• On-premise deployment</li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Get Your API Key</h4>
                <div className="bg-muted/20 p-3 rounded-lg font-mono text-sm">
                  curl -X POST https://api.balatrollm.com/auth/key
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Submit a Benchmark Run</h4>
                <div className="bg-muted/20 p-3 rounded-lg font-mono text-sm">
                  curl -X POST https://api.balatrollm.com/benchmark
                  <br />-H "Authorization: Bearer YOUR_KEY"
                  <br />-d {`'{"model": "gpt-4o", "prompt": "..."}'`}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Check Results</h4>
                <div className="bg-muted/20 p-3 rounded-lg font-mono text-sm">
                  curl https://api.balatrollm.com/results/RUN_ID
                  <br />-H "Authorization: Bearer YOUR_KEY"
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <code className="bg-muted/20 px-2 py-1 rounded">POST /benchmark</code>
                  <span className="text-muted-foreground">Submit run</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-muted/20 px-2 py-1 rounded">GET /results/:id</code>
                  <span className="text-muted-foreground">Get run results</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-muted/20 px-2 py-1 rounded">GET /leaderboard</code>
                  <span className="text-muted-foreground">Fetch leaderboard</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-muted/20 px-2 py-1 rounded">GET /models</code>
                  <span className="text-muted-foreground">List models</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-muted/20 px-2 py-1 rounded">GET /analytics</code>
                  <span className="text-muted-foreground">Performance data</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiAccess;