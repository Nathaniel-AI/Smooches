import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { UserProfile } from "@/components/user-profile";
import { VideoPlayer } from "@/components/video-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Video } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const userId = parseInt(params?.id || "0");

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: [`/api/users/${userId}/videos`],
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8">
        <UserProfile userId={userId} detailed />

        <Tabs defaultValue="videos" className="mt-8">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-[9/16]" />
                  ))}
                </div>
              ) : videos && videos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <VideoPlayer key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">No videos uploaded yet</p>
                  <p className="text-sm mt-2">Start creating content to share with your audience!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="live">
            <div className="text-center py-8 text-muted-foreground">
              No live streams available
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
