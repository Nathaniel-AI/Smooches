// SmoochesFeed.js – Video Feed Component for Smooches

import React from "react";
import { mockVideos } from "@/lib/mock-data";

export default function SmoochesFeed() {
  const videos = [
    { id: 1, user: "Kiki", url: "https://somecdn.com/video1.mp4", caption: "🔥 Morning vibes!" },
    { id: 2, user: "Lash", url: "https://somecdn.com/video2.mp4", caption: "Manifesting chaos 💅" },
    { id: 3, user: "Big Tank", url: "https://somecdn.com/video3.mp4", caption: "Late-night rants incoming." },
    ...mockVideos.map(video => ({
      id: video.id + 100,
      user: video.userId === 1 ? "Dance Queen" : video.userId === 2 ? "Chef Master" : "Music Pro",
      url: video.videoUrl, // Using videoUrl from the mock data
      caption: video.title,
    })),
  ];

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center my-4">Smooches Video Feed</h1>
      
      {videos.map((vid) => (
        <div key={vid.id} className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden">
          <video
            className="w-full rounded-t-xl h-[480px] object-cover bg-black"
            src={vid.url}
            controls
            loop
            poster="https://placehold.co/600x400/black/white?text=Loading+Video..."
          />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {vid.user.charAt(0)}
              </div>
              <strong className="text-foreground">@{vid.user}</strong>
            </div>
            <p className="text-muted-foreground">{vid.caption}</p>
            
            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>Like</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Comment</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}