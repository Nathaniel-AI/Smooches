import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Waveform, Music } from 'lucide-react';

interface ClipGeneratorProps {
  audioUrl: string;
  showName: string;
  onClipGenerated?: (clipUrl: string, thumbnailUrl: string) => void;
}

export function ClipGenerator({ audioUrl, showName, onClipGenerated }: ClipGeneratorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    waveform: string;
    duration: string;
  } | null>(null);
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGeneratePreview = async () => {
    const region = wavesurfer.current?.regions.list[Object.keys(wavesurfer.current?.regions.list)[0]];

    if (!region) {
      toast({
        title: "Error",
        description: "Please select a portion of the audio to clip",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Generate preview data
      const duration = region.end - region.start;
      setPreviewData({
        waveform: 'preview-waveform',
        duration: formatDuration(duration)
      });

      // Generate the actual clip
      const response = await apiRequest('POST', '/api/clips/generate', {
        audioUrl,
        startTime: region.start,
        endTime: region.end,
        showName
      });

      toast({
        title: "Success",
        description: "Preview generated successfully!",
      });

      if (onClipGenerated) {
        onClipGenerated(response.clipUrl, response.thumbnailUrl);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
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
            onClick={handleGeneratePreview}
            disabled={isGeneratingPreview}
            className="flex-1 gap-2"
          >
            {isGeneratingPreview ? (
              <>
                <Waveform className="w-4 h-4 animate-pulse" />
                Generating Preview...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                Generate Quick Preview
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Drag to select the portion you want to clip (max 30 seconds)
        </p>
      </Card>

      {previewData && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preview</h3>
            <span className="text-sm text-muted-foreground">
              Duration: {previewData.duration}
            </span>
          </div>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <Waveform className="w-12 h-12 text-muted-foreground" />
          </div>
        </Card>
      )}
    </div>
  );
}