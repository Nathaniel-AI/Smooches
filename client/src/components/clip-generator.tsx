import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Music, Save, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClipGeneratorProps {
  audioUrl: string;
  showName: string;
  stationId: number;
  userId: number;
  onClipGenerated?: (clipUrl: string, thumbnailUrl: string) => void;
}

export function ClipGenerator({ audioUrl, showName, stationId, userId, onClipGenerated }: ClipGeneratorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSavingClip, setIsSavingClip] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [clipTitle, setClipTitle] = useState("");
  const [clipDescription, setClipDescription] = useState("");
  const [generatedClip, setGeneratedClip] = useState<{
    clipUrl: string;
    thumbnailUrl: string;
    duration: number;
    startTime: number;
    endTime: number;
  } | null>(null);
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

      // Store the generated clip data
      setGeneratedClip({
        clipUrl: response.clipUrl,
        thumbnailUrl: response.thumbnailUrl,
        duration: response.duration,
        startTime: region.start,
        endTime: region.end
      });

      // Set a default title based on the show name
      setClipTitle(`${showName} - ${formatDuration(duration)} clip`);

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

  const handleSaveClip = async () => {
    if (!generatedClip) {
      toast({
        title: "Error",
        description: "You need to generate a clip first",
        variant: "destructive",
      });
      return;
    }

    if (!clipTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your clip",
        variant: "destructive",
      });
      return;
    }

    setIsSavingClip(true);
    try {
      await apiRequest('POST', '/api/clips', {
        userId,
        stationId,
        showName,
        title: clipTitle,
        description: clipDescription,
        clipUrl: generatedClip.clipUrl,
        thumbnailUrl: generatedClip.thumbnailUrl,
        duration: generatedClip.duration,
        startTime: Math.round(generatedClip.startTime),
        endTime: Math.round(generatedClip.endTime),
        sourceUrl: audioUrl
      });

      toast({
        title: "Success",
        description: "Clip saved successfully!",
      });

      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the clip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingClip(false);
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 animate-pulse">
                  <path d="M2 14h12m-4 4h12M4 4h12" />
                </svg>
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
          
          {generatedClip && (
            <div 
              className="aspect-video bg-muted rounded-lg overflow-hidden relative"
              style={{
                backgroundImage: `url(${generatedClip.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
                  <path d="M2 14h12m-4 4h12M4 4h12" />
                </svg>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save className="w-4 h-4" />
              Save Clip
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
          </div>
        </Card>
      )}
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Audio Clip</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="clip-title" className="col-span-1 text-right">
                Title
              </label>
              <Input
                id="clip-title"
                className="col-span-3"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="clip-description" className="col-span-1 text-right">
                Description
              </label>
              <Textarea
                id="clip-description"
                className="col-span-3"
                value={clipDescription}
                onChange={(e) => setClipDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveClip} disabled={isSavingClip}>
              {isSavingClip ? 'Saving...' : 'Save Clip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}