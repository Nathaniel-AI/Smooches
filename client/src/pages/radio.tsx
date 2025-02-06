import { RadioPlayer } from "@/components/radio-player";
import { Card } from "@/components/ui/card";

const MOCK_STATIONS = [
  {
    name: "Lofi Hip Hop Radio",
    streamUrl: "https://example.com/lofi-stream",
    cover: "https://picsum.photos/200/200?random=1"
  },
  {
    name: "Dance Hits",
    streamUrl: "https://example.com/dance-stream",
    cover: "https://picsum.photos/200/200?random=2"
  },
  {
    name: "Chill Vibes",
    streamUrl: "https://example.com/chill-stream",
    cover: "https://picsum.photos/200/200?random=3"
  }
];

export default function Radio() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Radio Stations</h1>
        
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Featured Station</h2>
            <RadioPlayer station={MOCK_STATIONS[0]} />
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_STATIONS.slice(1).map((station) => (
              <Card key={station.name} className="p-4">
                <RadioPlayer station={station} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
