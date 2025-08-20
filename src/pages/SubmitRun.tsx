import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SubmitRun = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Submit Benchmark Run
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Submit your custom LLM benchmark results to the community leaderboard.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle>Benchmark Submission</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your benchmark results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="claude-3.5-sonnet">Claude-3.5-Sonnet</SelectItem>
                        <SelectItem value="claude-3-haiku">Claude-3-Haiku</SelectItem>
                        <SelectItem value="gemini-pro">Gemini-Pro</SelectItem>
                        <SelectItem value="gemini-flash">Gemini-Flash</SelectItem>
                        <SelectItem value="custom">Custom Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="strategy">Strategy Name</Label>
                    <Input id="strategy" placeholder="e.g., Aggressive Joker Synergy" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Textarea 
                    id="prompt" 
                    placeholder="Paste your complete system prompt here..."
                    className="min-h-32"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avg-ante">Average Ante Reached</Label>
                    <Input id="avg-ante" type="number" step="0.1" placeholder="8.4" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="win-rate">Win Rate (%)</Label>
                    <Input id="win-rate" type="number" step="0.1" placeholder="23.1" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="runs">Number of Runs</Label>
                    <Input id="runs" type="number" placeholder="100" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avg-tokens">Avg Tokens per Run</Label>
                    <Input id="avg-tokens" type="number" placeholder="147000" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avg-cost">Avg Cost per Run ($)</Label>
                    <Input id="avg-cost" type="number" step="0.01" placeholder="0.12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Strategy Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your strategy, key insights, and approach..."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author/Team Name</Label>
                  <Input id="author" placeholder="Your name or team" />
                </div>

                <Button className="w-full bg-gradient-primary hover:shadow-glow-primary">
                  Submit Benchmark Run
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle>Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Minimum 50 benchmark runs</li>
                    <li>• Use standard Balatro v1.0.1n</li>
                    <li>• Include complete system prompt</li>
                    <li>• Provide accurate performance metrics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Review Process</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Results verified within 24-48 hours</li>
                    <li>• Random spot checks for accuracy</li>
                    <li>• Published to community board</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Having trouble with your submission? Check our documentation or reach out for support.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    View Documentation
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitRun;