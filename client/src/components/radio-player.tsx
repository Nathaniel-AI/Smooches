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
  AlertTriangle,
  RefreshCw,
  Redo2,
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
        if (!analyser) return;
        
        // Safe check added to fix TypeScript error
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

  const [audioError, setAudioError] = useState<string | null>(null);

  // Comprehensive audio setup and error handling
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Set initial volume
    audioRef.current.volume = volume / 100;
    
    // Reset any previous error state
    setAudioError(null);

    try {
      // Determine the best audio source using our local files
      const availableSources = [
        // From station if available
        station.streamUrl && station.streamUrl.trim() ? station.streamUrl : null, 
        // Local fallback files that are guaranteed to work
        "/short-audio.mp3",
        "/demo-audio.mp3",
      ].filter(Boolean) as string[];
      
      // We'll try these sources in sequence if errors occur
      let currentSourceIndex = 0;
      
      // Set initial source
      audioRef.current.src = availableSources[currentSourceIndex];
      
      // Event handlers for audio element
      const handleError = () => {
        console.warn(`Audio source failed: ${availableSources[currentSourceIndex]}`);
        
        // Try next source
        currentSourceIndex++;
        if (currentSourceIndex < availableSources.length) {
          console.log(`Trying next source: ${availableSources[currentSourceIndex]}`);
          
          if (audioRef.current) {
            audioRef.current.src = availableSources[currentSourceIndex];
            audioRef.current.load();
            // Don't auto-play to avoid autoplay restrictions
          }
        } else {
          // All sources failed
          setAudioError("Couldn't play this station. Please check your connection and try again.");
          setIsPlaying(false);
        }
      };
        
      const handleCanPlay = () => {
        console.log("Audio can play now");
        setAudioError(null);
      };

      const handleStalled = () => {
        console.warn("Audio playback stalled");
      };
        
      // Add all event listeners
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('stalled', handleStalled);
      
      // Pre-load audio to check if source is valid
      audioRef.current.load();
        
      // Cleanup function
      return () => {
        if (audioRef.current) {
          // Stop playback
          if (!audioRef.current.paused) {
            audioRef.current.pause();
          }
          
          // Remove listeners
          audioRef.current.removeEventListener('error', handleError);
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('stalled', handleStalled);
          
          // Clear source
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        }
      };
    } catch (err) {
      console.error("Error setting up audio:", err);
      setAudioError("There was a problem initializing the audio player.");
      return () => {};
    }
  }, [station.streamUrl, volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset audio errors
      setAudioError(null);
      
      // Try loading explicitly before playing
      try {
        audioRef.current.load();
        
        // Using the promise returned by play() to handle autoplay restrictions
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio started playing successfully
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Playback failed:", error);
              
              // Detect autoplay restrictions
              if (error.name === "NotAllowedError") {
                setAudioError("Audio playback was blocked. Please click play again or check your browser settings.");
              } else {
                // Try alternative audio source
                if (audioRef.current) {
                  audioRef.current.src = "https://samplelib.com/lib/preview/mp3/sample-3s.mp3";
                  audioRef.current.load();
                  audioRef.current.play().catch(e => {
                    setAudioError("Could not play any audio. Please check your device settings.");
                    console.error("Fallback audio failed:", e);
                  });
                }
              }
            });
        } else {
          // For older browsers without promises
          try {
            audioRef.current.play();
            setIsPlaying(true);
          } catch (e) {
            console.error("Legacy play error:", e);
            setAudioError("Could not play audio. Your browser may be too old.");
          }
        }
      } catch (e) {
        console.error("Error loading audio:", e);
        setAudioError("Could not load audio source.");
      }
    }
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
            
            {audioError ? (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <p className="font-medium text-sm">Audio Error</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{audioError}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (audioRef.current) {
                        // Try a different format or source
                        audioRef.current.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
                        audioRef.current.load();
                        togglePlay();
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M8 16H3v5"></path>
                    </svg>
                    Try Different Source
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (audioRef.current) {
                        // Retry current source
                        audioRef.current.load();
                        setAudioError(null);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                      <path d="M21 7v6h-6"></path>
                      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                    </svg>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-4">
                {/* Simple audio element - sources handled in useEffect */}
                <audio 
                  ref={audioRef} 
                  className="hidden"
                  preload="metadata"
                />
                
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="icon"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full"
                  disabled={!!audioError}
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
                    disabled={!!audioError}
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
                    disabled={!!audioError}
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
            )}
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