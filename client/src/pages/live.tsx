import { StreamPlayer } from "@/components/stream-player";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

const MOCK_STREAM = {
  id: 1,
  title: "Live Cooking Show",
  streamUrl: "https://example.com/stream.m3u8",
};

// Mock user for demo - in real app, this would come from auth
const MOCK_USER = {
  id: 1,
  username: "viewer1",
};

export default function Live() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">{MOCK_STREAM.title}</h1>
          <StreamPlayer streamUrl={MOCK_STREAM.streamUrl} />
        </div>

        <ChatSidebar 
          streamId={MOCK_STREAM.id} 
          userId={MOCK_USER.id}
          username={MOCK_USER.username}
        />
      </div>
    </main>
  );
}