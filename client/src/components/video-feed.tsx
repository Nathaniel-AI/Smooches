import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "./video-player";
import { SocialActions } from "./social-actions";
import { UserProfile } from "./user-profile";
import type { Video } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoFeed() {
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full aspect-[9/16]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 snap-y snap-mandatory overflow-y-auto h-[calc(100vh-4rem)]">
      {videos?.map((video, index) => (
        <div
          key={video.id}
          className="snap-start h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-md relative">
            <VideoPlayer video={video} autoPlay={index === 0} />
            <div className="absolute bottom-4 left-4 right-12">
              <UserProfile userId={video.userId} />
              <p className="text-white text-sm mt-2">{video.description}</p>
            </div>
            <div className="absolute right-4 bottom-4 flex flex-col items-center gap-4">
              <SocialActions video={video} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
