import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { type Video } from "@shared/schema";
import { EmojiReactions } from "./emoji-reactions";
import { ClipCreator } from "./clip-creator";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', () => {
      setCurrentTime(video.currentTime);
    });

    video.addEventListener('canplay', () => {
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(() => setIsPlaying(false));
      }
    });

    video.addEventListener('waiting', () => {
      setIsLoading(true);
    });

    video.addEventListener('playing', () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    });

    video.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    video.addEventListener('error', () => {
      setError('Failed to load video. Please try again.');
      setIsLoading(false);
    });

    // Load the video
    video.load();

    return () => {
      video.pause();
    };
  }, [video.videoUrl, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error('Failed to play video:', err);
        setError('Failed to play video. Please try again.');
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleRetry = () => {
    if (!videoRef.current) return;
    setError(null);
    setIsLoading(true);
    videoRef.current.load();
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
          crossOrigin="anonymous"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center space-y-4">
              <p className="text-white px-4">{error}</p>
              <Button variant="secondary" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        )}

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