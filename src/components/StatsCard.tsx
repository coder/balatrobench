import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "secondary" | "accent";
  className?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  variant = "default",
  className 
}: StatsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "border-primary/30 hover:shadow-glow-primary";
      case "secondary":
        return "border-secondary/30 hover:shadow-glow-secondary";
      case "accent":
        return "border-accent/30 hover:shadow-glow-accent";
      default:
        return "border-border/20";
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn(
      "bg-card border shadow-sm hover:shadow-md transition-all duration-200",
      className
    )}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {trend && trendValue && (
            <Badge variant="outline" className={cn("text-xs", getTrendColor())}>
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold text-accent mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;