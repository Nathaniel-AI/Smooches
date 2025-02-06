import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { RadioStation, RadioSchedule } from "@shared/schema";
import { EmojiReactions } from "./emoji-reactions";

interface RadioPlayerProps {
  station: RadioStation;
}

export function RadioPlayer({ station }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audio] = useState(new Audio(station.streamUrl));

  const { data: currentShow } = useQuery<RadioSchedule>({
    queryKey: [`/api/radio-stations/${station.id}/current-show`],
  });

  const { data: schedule } = useQuery<RadioSchedule[]>({
    queryKey: [`/api/radio-stations/${station.id}/schedule`],
  });

  useEffect(() => {
    audio.volume = volume / 100;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audio, volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    audio.volume = value / 100;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        {station.coverImage && (
          <img
            src={station.coverImage}
            alt={station.name}
            className="w-16 h-16 rounded-md object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold">{station.name}</h3>
          <p className="text-sm text-muted-foreground">
            {currentShow ? currentShow.showName : 'Live Radio'}
          </p>
        </div>
      </div>

      {currentShow && (
        <div className="text-sm space-y-1">
          <p className="font-medium">{currentShow.showName}</p>
          <p className="text-muted-foreground">
            {formatTime(currentShow.startTime)} - {formatTime(currentShow.endTime)}
          </p>
          {currentShow.description && (
            <p className="text-muted-foreground">{currentShow.description}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="w-12 h-12"
        >
          {isPlaying ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[volume]}
            onValueChange={(values) => handleVolumeChange(values[0])}
            max={100}
            step={1}
          />
        </div>
      </div>

      {schedule && schedule.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Upcoming Shows</h4>
          <div className="space-y-1">
            {schedule.slice(0, 3).map((show) => (
              <div key={show.id} className="text-sm flex justify-between">
                <span>{show.showName}</span>
                <span className="text-muted-foreground">
                  {formatTime(show.startTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <EmojiReactions targetType="radio" targetId={station.id} />
      </div>
    </Card>
  );
}