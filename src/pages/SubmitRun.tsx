import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

const SubmitRun = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Submit Custom Run
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Upload your strategy and run a custom benchmark with your OpenRouter API key.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle>Custom Benchmark Run</CardTitle>
                <CardDescription>
                  Upload your strategy file and configure your benchmark run.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="strategy-file">Strategy File (STRATEGY.md)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop your STRATEGY.md file
                    </p>
                    <input type="file" accept=".md" className="hidden" id="strategy-file" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy-name">Strategy Name</Label>
                  <Input id="strategy-name" placeholder="e.g., Aggressive Joker Synergy" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model (OpenRouter)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model from OpenRouter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai/gpt-4o">OpenAI: GPT-4o</SelectItem>
                      <SelectItem value="openai/gpt-4o-mini">OpenAI: GPT-4o Mini</SelectItem>
                      <SelectItem value="anthropic/claude-3.5-sonnet">Anthropic: Claude-3.5-Sonnet</SelectItem>
                      <SelectItem value="anthropic/claude-3-haiku">Anthropic: Claude-3-Haiku</SelectItem>
                      <SelectItem value="google/gemini-pro-1.5">Google: Gemini-Pro-1.5</SelectItem>
                      <SelectItem value="google/gemini-flash-1.5">Google: Gemini-Flash-1.5</SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-405b-instruct">Meta: Llama-3.1-405B</SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-70b-instruct">Meta: Llama-3.1-70B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenRouter API Key</Label>
                  <Input 
                    id="api-key" 
                    type="password" 
                    placeholder="sk-or-v1-..." 
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is encrypted and only used for this benchmark run. Set spending limits on OpenRouter for safety.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="recaptcha" className="rounded border-border" />
                  <Label htmlFor="recaptcha" className="text-sm">
                    I'm not a robot (Cloudflare verification)
                  </Label>
                </div>

                <Button className="w-full bg-gradient-primary hover:shadow-glow-primary">
                  Start Benchmark Run
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle>Tutorial: Creating Custom Runs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">1. Create Your STRATEGY.md</h4>
                  <p className="text-muted-foreground mb-2">
                    Write a markdown file containing your custom strategy instructions:
                  </p>
                  <div className="bg-muted/20 rounded-lg p-3 font-mono text-xs">
                    <pre className="text-muted-foreground"># My Balatro Strategy

## Core Principles
- Focus on joker synergies
- Prioritize chip multipliers
- Manage hand size carefully

## Early Game
- Buy jokers that scale
- Skip blinds strategically
...</pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">2. Select OpenRouter Model</h4>
                  <p className="text-muted-foreground mb-2">
                    Choose a model with tool-calling capabilities from OpenRouter's catalog.
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• GPT-4o: Best overall performance</li>
                    <li>• Claude-3.5-Sonnet: Strong reasoning</li>
                    <li>• Llama models: Cost-effective options</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">3. Get OpenRouter API Key</h4>
                  <p className="text-muted-foreground mb-2">Steps to create a secure API key:</p>
                  <ol className="space-y-1 text-muted-foreground ml-4 list-decimal">
                    <li>Create account on OpenRouter.ai</li>
                    <li>Go to Keys section</li>
                    <li>Create new key for BalatroBench</li>
                    <li>Set spending limit ($5-10 recommended)</li>
                    <li>Copy the key (starts with sk-or-v1-)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle>Benchmark Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Run Parameters</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 10 games per benchmark</li>
                    <li>• Random seeds for fairness</li>
                    <li>• Standard Balatro v1.0.1n</li>
                    <li>• Results published to community</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Estimated Costs</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• GPT-4o: ~$2-5 per run</li>
                    <li>• Claude-3.5: ~$1-3 per run</li>
                    <li>• Llama models: ~$0.50-1 per run</li>
                  </ul>
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