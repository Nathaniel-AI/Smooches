import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ClipGeneratorProps {
  audioUrl: string;
  onClipGenerated?: (clipUrl: string) => void;
}

export function ClipGenerator({ audioUrl, onClipGenerated }: ClipGeneratorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(var(--foreground))',
        progressColor: 'rgb(var(--primary))',
        cursorColor: 'rgb(var(--primary))',
        height: 100,
        plugins: [
          RegionsPlugin.create({
            dragSelection: true,
          }),
        ],
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('ready', () => {
        // Create an initial region of 30 seconds
        const duration = wavesurfer.current!.getDuration();
        const endTime = Math.min(30, duration);
        wavesurfer.current!.regions.add({
          start: 0,
          end: endTime,
          color: 'rgba(var(--primary), 0.2)',
        });
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  const handleGenerateClip = async () => {
    const region = wavesurfer.current?.regions.list[Object.keys(wavesurfer.current.regions.list)[0]];
    
    if (!region) {
      toast({
        title: "Error",
        description: "Please select a portion of the audio to clip",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/clips/generate', {
        audioUrl,
        startTime: region.start,
        endTime: region.end,
      });

      toast({
        title: "Success",
        description: "Clip generated successfully!",
      });

      if (onClipGenerated) {
        onClipGenerated(response.clipUrl);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate clip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div 
        ref={waveformRef}
        className="w-full rounded-lg overflow-hidden bg-card"
      />
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          className="w-12 h-12"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </Button>

        <Button
          onClick={handleGenerateClip}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Generating..." : "Generate Clip"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Drag to select the portion you want to clip
      </p>
    </Card>
  );
}
