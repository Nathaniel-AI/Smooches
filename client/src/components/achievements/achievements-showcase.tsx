import { ACHIEVEMENTS } from "@/lib/achievements";
import { AchievementBadge } from "./achievement-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@shared/schema";

interface AchievementsShowcaseProps {
  user: User;
  userStats: {
    totalVideos: number;
    totalStreams: number;
    totalReactions: number;
    subscriberCount: number;
  };
}

export function AchievementsShowcase({ user, userStats }: AchievementsShowcaseProps) {
  const checkAchievementUnlocked = (achievement: typeof ACHIEVEMENTS[number]) => {
    const { type, count } = achievement.requirement;
    
    switch (type) {
      case 'followers':
        return (user.followers || 0) >= count;
      case 'videos':
        return userStats.totalVideos >= count;
      case 'streams':
        return userStats.totalStreams >= count;
      case 'reactions':
        return userStats.totalReactions >= count;
      case 'subscriptions':
        return userStats.subscriberCount >= count;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Achievements</span>
          <span className="text-sm font-normal text-muted-foreground">
            {ACHIEVEMENTS.filter(a => checkAchievementUnlocked(a)).length} / {ACHIEVEMENTS.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={checkAchievementUnlocked(achievement)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
