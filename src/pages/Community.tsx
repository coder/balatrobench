import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Community = () => {
  const communitySubmissions = [
    {
      id: 1,
      title: "Aggressive Joker Synergy Strategy",
      author: "AIResearcher23",
      model: "GPT-4o",
      score: "9.2 Ante",
      votes: 47,
      date: "2024-01-15",
      strategy: "Focus on multiplicative jokers early game"
    },
    {
      id: 2,
      title: "Conservative Money Management",
      author: "BalatroBot",
      model: "Claude-3.5-Sonnet",
      score: "8.8 Ante", 
      votes: 32,
      date: "2024-01-12",
      strategy: "Prioritize money generation over risky plays"
    },
    {
      id: 3,
      title: "High Card Meta Exploitation",
      author: "CardCounter",
      model: "Gemini-Pro",
      score: "8.1 Ante",
      votes: 28,
      date: "2024-01-10",
      strategy: "Exploit high card hands with specific jokers"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Community Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mb-6">
            Explore custom strategies and prompts submitted by the community. 
            Submit your own approach and see how it performs!
          </p>
          <Button className="bg-gradient-primary hover:shadow-glow-primary">
            Submit Your Strategy
          </Button>
        </div>

        <div className="grid gap-6">
          {communitySubmissions.map((submission) => (
            <Card key={submission.id} className="bg-gradient-card border-border/20 shadow-card hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{submission.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {submission.author}</span>
                      <Badge variant="outline">{submission.model}</Badge>
                      <span>{submission.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {submission.score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {submission.votes} votes
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{submission.strategy}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    ↑ Upvote
                  </Button>
                  <Button variant="ghost" size="sm">
                    Try Strategy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="bg-gradient-card border-border/20 shadow-card">
            <CardHeader>
              <CardTitle>How to Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">1. Prepare Your Prompt</h4>
                  <p className="text-muted-foreground">
                    Create a custom system prompt with your unique strategy approach.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Run Benchmark</h4>
                  <p className="text-muted-foreground">
                    Test your prompt against our standard seed set using our API.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Submit Results</h4>
                  <p className="text-muted-foreground">
                    Upload your results with a description of your strategy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;