import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Heart,
  MessageCircle,
  Gift,
  Share2,
  Bookmark,
  DollarSign,
  Send,
  X,
  ChevronUp
} from "lucide-react";
import { type Video } from "@shared/schema";
import { EmojiReactions } from "./emoji-reactions";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  video: Video;
  autoPlay?: boolean;
}

export function VideoPlayer({ video, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const { user } = useAuth();
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Mock comments data (would be fetched from API in production)
  const [comments, setComments] = useState([
    { id: 1, username: "musiclover", text: "This beat is fire! 🔥", timestamp: "2m ago", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=musiclover" },
    { id: 2, username: "dancequeen", text: "Love the choreography!", timestamp: "5m ago", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=dancequeen" },
    { id: 3, username: "beatmaker", text: "Who produced this track?", timestamp: "10m ago", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=beatmaker" }
  ]);

  // Gift options
  const giftOptions = [
    { id: 1, name: "Rose", icon: "🌹", price: 5 },
    { id: 2, name: "Crown", icon: "👑", price: 20 },
    { id: 3, name: "Diamond", icon: "💎", price: 50 },
    { id: 4, name: "Rocket", icon: "🚀", price: 100 },
    { id: 5, name: "Trophy", icon: "🏆", price: 200 },
    { id: 6, name: "Microphone", icon: "🎤", price: 30 }
  ];

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }

    const videoElement = videoRef.current;
    if (videoElement) {
      const updateProgress = () => {
        if (videoElement.duration) {
          setProgress((videoElement.currentTime / videoElement.duration) * 100);
        }
      };

      videoElement.addEventListener('timeupdate', updateProgress);
      return () => {
        videoElement.removeEventListener('timeupdate', updateProgress);
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() && user) {
      const newComment = {
        id: Date.now(),
        username: user.username,
        text: comment,
        timestamp: "Just now",
        avatar: user.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`
      };
      setComments([newComment, ...comments]);
      setComment("");
    }
  };

  const sendGift = (giftId: number) => {
    // In a real implementation, this would send the gift via API
    console.log(`Sending gift ${giftId} to creator of video ${video.id}`);
    
    // Show a floating gift animation
    const giftOption = giftOptions.find(gift => gift.id === giftId);
    if (giftOption) {
      const giftElement = document.createElement('div');
      giftElement.className = 'gift-animation';
      giftElement.textContent = giftOption.icon;
      giftElement.style.cssText = `
        position: absolute;
        font-size: 48px;
        bottom: 50%;
        left: ${Math.random() * 80 + 10}%;
        animation: float-up 3s ease-out forwards;
        z-index: 20;
      `;
      
      document.getElementById('gift-container')?.appendChild(giftElement);
      
      setTimeout(() => {
        giftElement.remove();
      }, 3000);
    }
    
    // Close the gift panel
    setShowGiftPanel(false);
  };

  return (
    <Card className="relative w-full max-w-3xl mx-auto aspect-[9/16] bg-black overflow-hidden shadow-xl">
      {/* Gift animation container */}
      <div id="gift-container" className="absolute inset-0 pointer-events-none z-20"></div>
      
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
        poster={video.thumbnail || undefined}
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={togglePlay}
            className="w-24 h-24 bg-primary/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-primary/50 hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-12 h-12"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Video info and creator overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent z-10">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
            <p className="text-white/80">{video.description}</p>
            
            {/* Creator info */}
            <div className="flex items-center mt-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 mr-3">
                <img 
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${video.userId}`} 
                  alt="Creator" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-medium">@creator{video.userId}</p>
                <Button variant="outline" size="sm" className="mt-1 h-7 text-xs rounded-full bg-primary/20 border-primary/50 hover:bg-primary/40">
                  Follow
                </Button>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col items-center gap-5 ml-4">
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" className="rounded-full bg-black/30 backdrop-blur-md hover:bg-white/20">
                <Heart className="w-6 h-6 text-white" />
              </Button>
              <span className="text-white text-xs mt-1">2.4K</span>
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/30 backdrop-blur-md hover:bg-white/20"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </Button>
              <span className="text-white text-xs mt-1">{comments.length}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/30 backdrop-blur-md hover:bg-white/20"
                onClick={() => setShowGiftPanel(!showGiftPanel)}
              >
                <Gift className="w-6 h-6 text-white" />
              </Button>
              <span className="text-white text-xs mt-1">Gift</span>
            </div>
            
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" className="rounded-full bg-black/30 backdrop-blur-md hover:bg-white/20">
                <Share2 className="w-6 h-6 text-white" />
              </Button>
              <span className="text-white text-xs mt-1">Share</span>
            </div>
            
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" className="rounded-full bg-black/30 backdrop-blur-md hover:bg-white/20">
                <Bookmark className="w-6 h-6 text-white" />
              </Button>
              <span className="text-white text-xs mt-1">Save</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div 
          className="mt-4 h-1 bg-white/20 rounded-full cursor-pointer"
          onClick={seekTo}
        >
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Volume and controls */}
        <div className="flex items-center justify-between mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 text-white"
            onClick={toggleMute}
          >
            {isMuted ? '🔇' : '🔊'}
          </Button>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 accent-primary"
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-white"
            onClick={togglePlay}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </Button>
        </div>

        {/* Emoji reactions container */}
        <div className="mt-3 flex justify-center">
          <EmojiReactions targetType="video" targetId={video.id} />
        </div>
      </div>
      
      {/* Gift panel */}
      <AnimatePresence>
        {showGiftPanel && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 z-30"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-bold">Send a Gift</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowGiftPanel(false)}
                className="rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {giftOptions.map(gift => (
                <Button
                  key={gift.id}
                  variant="outline"
                  className="flex flex-col items-center p-3 border-white/20 hover:bg-primary/20 transition-colors"
                  onClick={() => sendGift(gift.id)}
                >
                  <span className="text-3xl mb-1">{gift.icon}</span>
                  <span className="text-white text-sm">{gift.name}</span>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-3 h-3 text-primary" />
                    <span className="text-primary text-xs">{gift.price}</span>
                  </div>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            className="absolute top-0 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-md z-30 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white text-lg font-bold">Comments</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowComments(false)}
                className="rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                      <img 
                        src={comment.avatar} 
                        alt={comment.username} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">@{comment.username}</p>
                        <span className="text-white/50 text-xs">{comment.timestamp}</span>
                      </div>
                      <p className="text-white/90 text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/10 border-white/20 text-white"
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/80">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}