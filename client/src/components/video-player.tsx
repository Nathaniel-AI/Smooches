import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { type Video } from "@shared/schema";
import { EmojiReactions } from "./emoji-reactions";
import { ClipCreator } from "./clip-creator";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  video: Video;
  autoPlay?: boolean;
}

export function VideoPlayer({ video, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handleLoadStart = () => {
        setIsLoading(true);
        setError(null);
      };

      const handleLoadedData = () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(console.error);
          setIsPlaying(true);
        }
      };

      const handleError = () => {
        setIsLoading(false);
        setError("Failed to load video");
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="relative w-full aspect-[9/16] bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          onClick={togglePlay}
          poster={video.thumbnail || undefined}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-center px-4">{error}</p>
          </div>
        )}

        {/* Play button overlay */}
        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-8 h-8"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Emoji reactions container */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center">
            <EmojiReactions targetType="video" targetId={video.id} />
          </div>
        </div>
      </Card>

      {!error && (
        <ClipCreator
          video={video}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      )}
    </div>
  );
}