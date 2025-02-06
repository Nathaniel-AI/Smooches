import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface RadioPlayerProps {
  station: {
    name: string;
    streamUrl: string;
    cover: string;
  };
}

export function RadioPlayer({ station }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audio] = useState(new Audio(station.streamUrl));

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

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={station.cover}
          alt={station.name}
          className="w-16 h-16 rounded-md"
        />
        <div>
          <h3 className="font-semibold">{station.name}</h3>
          <p className="text-sm text-muted-foreground">Live Radio</p>
        </div>
      </div>

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
    </Card>
  );
}
