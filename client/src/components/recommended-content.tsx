import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "./video-player";
import { RadioPlayer } from "./radio-player";
import { recommendationEngine } from "@/lib/recommendation-engine";
import type { Video, RadioStation } from "@shared/schema";

interface RecommendedContentProps {
  preferences: {
    genres: string[];
    creators: number[];
    audioQuality: string;
  };
}

export function RecommendedContent({ preferences }: RecommendedContentProps) {
  const { data: videos, isLoading: videosLoading, error: videosError } = useQuery<(Video & { genres: string[] })[]>({
    queryKey: ["/api/videos"],
  });

  const { data: stations, isLoading: stationsLoading, error: stationsError } = useQuery<(RadioStation & { genres: string[] })[]>({
    queryKey: ["/api/radio-stations"],
  });

  if (videosError || stationsError) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading recommendations
      </div>
    );
  }

  if (videosLoading || stationsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-accent/10 animate-pulse rounded-lg" />
      </div>
    );
  }

  const recommendedVideos = videos 
    ? recommendationEngine.sortByRecommendationScore(videos, preferences).slice(0, 3)
    : [];

  const recommendedStations = stations
    ? recommendationEngine.sortByRecommendationScore(stations, preferences).slice(0, 2)
    : [];

  if (!recommendedVideos.length && !recommendedStations.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No recommendations available yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendedVideos.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Recommended Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedVideos.map(video => (
              <Card key={video.id} className="overflow-hidden">
                <VideoPlayer video={video} />
                <CardContent className="p-4">
                  <h3 className="font-semibold">{video.title}</h3>
                  {video.reasons && video.reasons.length > 0 && (
                    <div className="mt-2">
                      {video.reasons.map((reason, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 mr-2 mb-2 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {recommendedStations.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Recommended Radio Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedStations.map(station => (
              <Card key={station.id}>
                <RadioPlayer station={station} />
                <CardContent className="p-4">
                  {station.reasons && station.reasons.length > 0 && (
                    <div className="mt-2">
                      {station.reasons.map((reason, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 mr-2 mb-2 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}