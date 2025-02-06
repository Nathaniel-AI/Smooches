import { useState } from 'react';
import { VideoFeed } from "@/components/video-feed";
import { RecommendedContent } from "@/components/recommended-content";

export default function Home() {
  // TODO: In the future, these preferences should come from user settings/API
  const [preferences] = useState({
    genres: ["Pop", "Hip Hop", "Electronic"],
    creators: [1, 2], // Mock creator IDs
    audioQuality: "high"
  });

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        <RecommendedContent preferences={preferences} />
        <VideoFeed />
      </div>
    </main>
  );
}