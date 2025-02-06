import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Scissors, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Video, PodcastClip } from "@shared/schema";

interface ClipCreatorProps {
  video: Video;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function ClipCreator({ video, currentTime, onSeek }: ClipCreatorProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clips } = useQuery<PodcastClip[]>({
    queryKey: [`/api/videos/${video.id}/podcast-clips`],
  });

  const createClipMutation = useMutation({
    mutationFn: async (clip: {
      videoId: number;
      title: string;
      description: string;
      startTime: number;
      endTime: number;
    }) => {
      return apiRequest('POST', '/api/podcast-clips', {
        ...clip,
        userId: 1, // TODO: Get from auth
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/videos/${video.id}/podcast-clips`],
      });
      setStartTime(null);
      setTitle("");
      setDescription("");
      toast({
        title: "Clip created",
        description: "Your clip has been created successfully.",
      });
    },
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSetStartTime = () => {
    setStartTime(currentTime);
  };

  const handleCreateClip = () => {
    if (!startTime) return;

    createClipMutation.mutate({
      videoId: video.id,
      title,
      description,
      startTime,
      endTime: currentTime,
    });
  };

  const handleShare = (clipId: number) => {
    const url = `${window.location.origin}/videos/${video.id}?clip=${clipId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Clip link has been copied to clipboard.",
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSetStartTime}
          disabled={startTime !== null}
        >
          <Scissors className="w-4 h-4 mr-2" />
          Set Start ({formatTime(currentTime)})
        </Button>

        {startTime && (
          <>
            <span className="text-sm text-muted-foreground">
              Start: {formatTime(startTime)}
            </span>
            <Input
              placeholder="Clip title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateClip}
              disabled={!title}
            >
              Create Clip
            </Button>
          </>
        )}
      </div>

      {startTime && (
        <Textarea
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-20"
        />
      )}

      {clips && clips.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Clips</h3>
          <div className="space-y-2">
            {clips.map((clip) => (
              <Card key={clip.id} className="p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{clip.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSeek(clip.startTime)}
                  >
                    Play
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(clip.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
