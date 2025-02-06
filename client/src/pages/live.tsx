import { StreamPlayer } from "@/components/stream-player";

const MOCK_STREAM = {
  title: "Live Cooking Show",
  streamUrl: "https://example.com/stream.m3u8",
};

export default function Live() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Live Streams</h1>
        <StreamPlayer streamUrl={MOCK_STREAM.streamUrl} />
      </div>
    </main>
  );
}
