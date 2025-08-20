import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardEntry {
  rank: number;
  model: string;
  provider: string;
  avgAnte: number;
  winRate: number;
  avgScore: number;
  tokenEfficiency: number;
  costPerGame: number;
  lastUpdated: string;
}

const mockData: LeaderboardEntry[] = [
  {
    rank: 1,
    model: "GPT-4o",
    provider: "OpenAI",
    avgAnte: 8.4,
    winRate: 23.1,
    avgScore: 145760,
    tokenEfficiency: 2.3,
    costPerGame: 0.45,
    lastUpdated: "2 hours ago"
  },
  {
    rank: 2,
    model: "Claude-3.5 Sonnet",
    provider: "Anthropic",
    avgAnte: 7.9,
    winRate: 19.8,
    avgScore: 128950,
    tokenEfficiency: 1.9,
    costPerGame: 0.52,
    lastUpdated: "4 hours ago"
  },
  {
    rank: 3,
    model: "Gemini-1.5-Pro",
    provider: "Google",
    avgAnte: 7.2,
    winRate: 15.4,
    avgScore: 112340,
    tokenEfficiency: 2.1,
    costPerGame: 0.38,
    lastUpdated: "1 hour ago"
  },
  {
    rank: 4,
    model: "GPT-4 Turbo",
    provider: "OpenAI",
    avgAnte: 6.8,
    winRate: 12.7,
    avgScore: 98230,
    tokenEfficiency: 1.8,
    costPerGame: 0.41,
    lastUpdated: "6 hours ago"
  }
];

const getRankBadgeVariant = (rank: number) => {
  if (rank === 1) return "default";
  if (rank <= 3) return "secondary";
  return "outline";
};

const Leaderboard = () => {
  return (
    <Card className="bg-gradient-card border-border/20 shadow-elevation">
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Official Leaderboard</h2>
            <p className="text-muted-foreground">Top performing models in Balatro gameplay</p>
          </div>
          <Button variant="outline" className="border-border/40">
            View All Results
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20 hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Rank</TableHead>
              <TableHead className="text-muted-foreground">Model</TableHead>
              <TableHead className="text-center text-muted-foreground">Avg Ante</TableHead>
              <TableHead className="text-center text-muted-foreground">Win Rate</TableHead>
              <TableHead className="text-center text-muted-foreground">Avg Score</TableHead>
              <TableHead className="text-center text-muted-foreground">Token Eff.</TableHead>
              <TableHead className="text-center text-muted-foreground">Cost/Game</TableHead>
              <TableHead className="text-center text-muted-foreground">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((entry) => (
              <TableRow 
                key={entry.rank} 
                className="border-border/20 hover:bg-muted/20 transition-colors"
              >
                <TableCell>
                  <Badge variant={getRankBadgeVariant(entry.rank)} className="w-8 h-8 rounded-full flex items-center justify-center">
                    #{entry.rank}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold text-foreground">{entry.model}</div>
                    <div className="text-xs text-muted-foreground">{entry.provider}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-primary font-bold">{entry.avgAnte}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-success font-bold">{entry.winRate}%</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-accent font-bold">{entry.avgScore.toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-secondary font-bold">{entry.tokenEfficiency}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-warning font-bold">${entry.costPerGame}</span>
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {entry.lastUpdated}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default Leaderboard;