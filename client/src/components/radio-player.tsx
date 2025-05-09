import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Calendar, 
  Clock, 
  Users, 
  Music, 
  Heart, 
  Share2,
  MoreHorizontal,
  MessageCircle,
  CalendarCheck
} from "lucide-react";
import type { RadioStation, RadioSchedule } from "@shared/schema";
import { EmojiReactions } from "./emoji-reactions";
import { ScheduleModal } from "./radio/schedule-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface RadioPlayerProps {
  station: RadioStation;
}

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

function AudioVisualizer({ audioRef, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualValues, setVisualValues] = useState(Array(20).fill(3));
  
  useEffect(() => {
    let animationFrameId: number;
    let analyser: AnalyserNode | null = null;
    let audioContext: AudioContext | null = null;
    let dataArray: Uint8Array = new Uint8Array(0); // Initialize with empty array instead of null
    let source: MediaElementAudioSourceNode | null = null;
    
    if (isPlaying && audioRef.current) {
      // Set up audio analyzer
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      
      // Ensure dataArray is not null in TypeScript
      if (!dataArray) return;
      
      const draw = () => {
        if (!analyser || !dataArray) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Sample values from the frequency data at regular intervals to get 20 values
        const sampleSize = Math.floor(dataArray.length / 20);
        const newVisualValues = Array(20).fill(0).map((_, i) => {
          const startIndex = i * sampleSize;
          const slice = dataArray.slice(startIndex, startIndex + sampleSize);
          const average = slice.reduce((a, b) => a + b, 0) / slice.length;
          
          // Normalize value between 3 and 50
          return 3 + (average / 255) * 47;
        });
        
        setVisualValues(newVisualValues);
        animationFrameId = requestAnimationFrame(draw);
      };
      
      draw();
    } else {
      // When not playing, animate visualizer with random values
      const simulateVisualizer = () => {
        setVisualValues(prev => prev.map(() => 
          Math.max(3, Math.min(25, prev[0] + (Math.random() * 6 - 3)))
        ));
        animationFrameId = requestAnimationFrame(simulateVisualizer);
      };
      simulateVisualizer();
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (source && audioContext) {
        source.disconnect();
      }
    };
  }, [isPlaying, audioRef]);
  
  return (
    <div className="flex items-end justify-center h-10 gap-0.5 mt-2">
      {visualValues.map((value, i) => (
        <motion.div
          key={i}
          initial={{ height: 3 }}
          animate={{ height: value }}
          transition={{ duration: 0.2 }}
          className="w-1.5 bg-primary/80 rounded-full"
        />
      ))}
    </div>
  );
}

export function RadioPlayer({ station }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Mock chat messages (would come from API in production)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, userId: 1, username: "melodymaven", content: "This DJ is amazing! 🎧", timestamp: "5m ago", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=melodymaven" },
    { id: 2, userId: 2, username: "beatsmith", content: "Anyone know what song this is?", timestamp: "2m ago", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=beatsmith" },
    { id: 3, userId: 3, username: "vinyljunkie", content: "I'm loving the vibe today!", timestamp: "1m ago", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=vinyljunkie" },
  ]);

  const { data: currentShow, isLoading: isShowLoading } = useQuery<RadioSchedule>({
    queryKey: [`/api/radio-stations/${station.id}/current-show`],
  });

  const { data: schedule } = useQuery<RadioSchedule[]>({
    queryKey: [`/api/radio-stations/${station.id}/schedule`],
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.src = station.streamUrl;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      };
    }
  }, [station.streamUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Using the promise returned by play() to handle autoplay restrictions
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing successfully
          })
          .catch(error => {
            console.error("Playback failed:", error);
            // Handle the error or show a UI message about autoplay being blocked
          });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleScheduleCreated = () => {
    // Invalidate schedule queries to refresh the data
    queryClient.invalidateQueries({
      queryKey: [`/api/radio-stations/${station.id}/schedule`]
    });
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const newMessage = {
          id: Date.now(),
          userId: user.id,
          username: user.username,
          content: message,
          timestamp: "Just now",
          avatar: user.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`
        };
        setChatMessages([newMessage, ...chatMessages]);
        setMessage("");
        setIsLoading(false);
      }, 500);
    }
  };

  // Active listeners count (would come from WebSocket in production)
  const activeListeners = Math.floor(Math.random() * 100) + 50;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background shadow-lg overflow-hidden border-border/80">
      <div className="flex flex-col md:flex-row">
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="flex items-start gap-6">
            {/* Station image */}
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted/20 flex-shrink-0">
              {station.coverImage ? (
                <img
                  src={station.coverImage}
                  alt={station.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <Music className="w-10 h-10 text-primary/60" />
                </div>
              )}
              
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-1 bg-primary/40 rounded-full animate-pulse"></div>
                    <span className="relative text-white font-bold">LIVE</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Station info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="mb-2 bg-primary/20 hover:bg-primary/30 text-primary border-none">
                    <Users className="w-3 h-3 mr-1" />
                    {activeListeners} listening
                  </Badge>
                  <h2 className="text-2xl font-bold">{station.name}</h2>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                  >
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                  >
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <ScheduleModal 
                    stationId={station.id}
                    onScheduleCreated={handleScheduleCreated}
                  />
                </div>
              </div>
              
              {/* Current show */}
              {currentShow ? (
                <div className="mt-4 p-3 rounded-lg bg-accent/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <CalendarCheck className="h-3 w-3 mr-1" />
                        Now Playing
                      </p>
                      <h3 className="font-bold mt-1">{currentShow.showName}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground flex items-center justify-end">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(currentShow.startTime)} - {formatTime(currentShow.endTime)}
                      </p>
                    </div>
                  </div>
                  {currentShow.description && (
                    <p className="text-sm text-muted-foreground mt-2">{currentShow.description}</p>
                  )}
                </div>
              ) : isShowLoading ? (
                <div className="mt-4 h-20 animate-pulse rounded-lg bg-muted/50"></div>
              ) : (
                <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-dashed border-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No show currently playing</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Audio player controls */}
          <div className="mt-6">
            <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
            
            <div className="flex items-center gap-4 mt-4">
              <audio ref={audioRef} className="hidden" />
              
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="icon"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>

              <div className="flex-1 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVolumeChange(volume === 0 ? 80 : 0)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                <Slider
                  value={[volume]}
                  onValueChange={(values) => handleVolumeChange(values[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full border"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Upcoming shows */}
          {schedule && schedule.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming Shows
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedule.slice(0, 4).map((show) => (
                  <div 
                    key={show.id} 
                    className="p-3 rounded-lg border border-border/60 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">{show.showName}</h5>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(show.startTime)}
                      </Badge>
                    </div>
                    {show.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {show.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Emoji reactions */}
          <div className="mt-6 flex justify-center">
            <EmojiReactions targetType="radio" targetId={station.id} />
          </div>
        </div>
        
        {/* Chat panel (slides in/out) */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              className="w-full md:w-80 bg-card border-l border-border/80 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 border-b border-border/80 flex justify-between items-center">
                <h4 className="font-medium">Live Chat</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowChat(false)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.avatar} alt={msg.username} />
                        <AvatarFallback>{msg.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <h5 className="text-sm font-medium">@{msg.username}</h5>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t border-border/80">
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={isLoading || !message.trim()}
                  >
                    Send
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}