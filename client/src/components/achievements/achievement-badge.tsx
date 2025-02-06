import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
}

export function AchievementBadge({ achievement, unlocked = false }: AchievementBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            className={`relative group cursor-help transition-all duration-300 ${
              unlocked ? 'opacity-100' : 'opacity-40 grayscale'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <span className="text-2xl">{achievement.icon}</span>
            </div>
            {unlocked && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[200px] space-y-2 p-4"
        >
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          {unlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
