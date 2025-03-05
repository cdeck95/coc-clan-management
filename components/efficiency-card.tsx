import { AttackEfficiency } from "@/types/clash";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface EfficiencyCardProps {
  efficiency: AttackEfficiency;
  rank: number;
}

export function EfficiencyCard({ efficiency, rank }: EfficiencyCardProps) {
  const lastUpdated = formatDistanceToNow(new Date(efficiency.lastUpdated), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">
              {rank}. {efficiency.memberName}
            </CardTitle>
            <CardDescription>
              {efficiency.totalAttacks} attacks recorded
            </CardDescription>
          </div>
          <div className="text-4xl font-bold text-sidebar-primary">
            {efficiency.averageStars.toFixed(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Stars per Attack</span>
              <span className="font-medium">
                {efficiency.averageStars.toFixed(2)}/3
              </span>
            </div>
            <Progress
              value={(efficiency.averageStars / 3) * 100}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Destruction %</span>
              <span className="font-medium">
                {efficiency.averageDestruction.toFixed(1)}%
              </span>
            </div>
            <Progress value={efficiency.averageDestruction} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>3-Star Rate</span>
              <span className="font-medium">
                {efficiency.threeStarRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={efficiency.threeStarRate} className="h-2" />
          </div>

          <p className="text-xs text-muted-foreground text-right">
            Last updated: {lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
