import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "./video-player";
import { SocialActions } from "./social-actions";
import { UserProfile } from "./user-profile";
import type { Video } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockVideos } from "@/lib/mock-data";

export function VideoFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // In real implementation, this would be replaced with proper API pagination
  const [page, setPage] = useState(1);
  const { data: apiVideos, isLoading, refetch } = useQuery<Video[]>({
    queryKey: ["/api/videos", page],
  });
  
  // Combine API videos with mock videos to ensure we have more content
  // In a production app, this would be replaced with proper API pagination
  const videos = [...(apiVideos || [])];
  
  // Only add mock videos if we don't have enough real ones
  if (videos.length < 10) {
    const additionalMockVideos = mockVideos
      .filter(mv => !videos.some(v => v.id === mv.id))
      .map(mv => ({
        ...mv,
        id: mv.id + 1000, // Ensure unique IDs by adding offset to mock data
      }));
    videos.push(...additionalMockVideos);
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = containerRef.current.scrollTop;
      const newIndex = Math.round(scrollTop / containerHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        
        // Load more content when approaching the end
        if (newIndex > videos.length - 3) {
          setPage(prev => prev + 1);
        }
      }
    }
  };
  
  const scrollToNext = () => {
    if (containerRef.current && currentIndex < videos.length - 1) {
      const nextIndex = currentIndex + 1;
      containerRef.current.scrollTo({
        top: nextIndex * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    
    // Scroll back to top
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [currentIndex, videos.length]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-[80vh] max-w-3xl mx-auto rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-black/90">
      {/* Refresh button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-50 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20"
        onClick={handleRefresh}
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="snap-start h-full w-full flex flex-col items-center justify-center p-4"
          >
            <VideoPlayer 
              video={video} 
              autoPlay={index === currentIndex} 
            />
          </div>
        ))}
      </div>
      
      {/* Down arrow navigation */}
      {currentIndex < videos.length - 1 && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20 animate-bounce"
          onClick={scrollToNext}
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
