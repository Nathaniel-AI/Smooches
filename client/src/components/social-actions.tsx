import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Video } from "@shared/schema";

interface SocialActionsProps {
  video: Video;
}

export function SocialActions({ video }: SocialActionsProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/20 backdrop-blur-lg hover:bg-black/40"
        onClick={() => setLiked(!liked)}
      >
        <Heart
          className={`w-6 h-6 ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
        />
        <span className="text-xs text-white mt-1">{video.likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/20 backdrop-blur-lg hover:bg-black/40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="text-xs text-white mt-1">{video.comments}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/20 backdrop-blur-lg hover:bg-black/40"
      >
        <Share2 className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
