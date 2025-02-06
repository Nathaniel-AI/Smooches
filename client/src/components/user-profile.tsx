import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@shared/schema";

interface UserProfileProps {
  userId: number;
  detailed?: boolean;
}

export function UserProfile({ userId, detailed = false }: UserProfileProps) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  if (isLoading) {
    return <Skeleton className="w-full h-12" />;
  }

  if (!user) return null;

  return (
    <div className={`flex items-center gap-4 ${detailed ? 'p-4' : ''}`}>
      <Avatar className="w-12 h-12">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h3 className="font-semibold text-white">{user.displayName}</h3>
        <p className="text-sm text-gray-300">@{user.username}</p>
        {detailed && <p className="mt-2 text-gray-300">{user.bio}</p>}
      </div>

      {detailed && (
        <div className="flex gap-4 text-center">
          <div>
            <p className="font-semibold text-white">{user.followers}</p>
            <p className="text-sm text-gray-300">Followers</p>
          </div>
          <div>
            <p className="font-semibold text-white">{user.following}</p>
            <p className="text-sm text-gray-300">Following</p>
          </div>
        </div>
      )}
      
      <Button variant="secondary" size="sm">
        Follow
      </Button>
    </div>
  );
}
