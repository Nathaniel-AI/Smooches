import { useQuery } from "@tanstack/react-query";
import { RadioPlayer } from "@/components/radio-player";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RadioStation } from "@shared/schema";

export default function Radio() {
  const { data: stations, isLoading } = useQuery<RadioStation[]>({
    queryKey: ["/api/radio-stations"],
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Radio Stations</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Radio Stations</h1>

        {stations && stations.length > 0 ? (
          <div className="grid gap-6">
            {stations.map((station) => (
              <Card key={station.id} className="p-4">
                <RadioPlayer station={station} />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No radio stations available</p>
          </Card>
        )}
      </div>
    </main>
  );
}