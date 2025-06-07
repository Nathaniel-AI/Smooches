import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RadioPlayer } from "@/components/radio-player";
import { RadioScheduler } from "@/components/radio/radio-scheduler";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarPlus, Radio as RadioIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-simple";
import type { RadioStation } from "@shared/schema";

export default function Radio() {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const { user } = useAuth();

  const { data: stations, isLoading } = useQuery<RadioStation[]>({
    queryKey: ["/api/radio-stations"],
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Radio Hub</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const handleScheduleShow = (stationId: number) => {
    setSelectedStationId(stationId);
    setIsSchedulerOpen(true);
  };

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Radio Hub</h1>
          {user && (
            <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Schedule Show
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule Radio Show</DialogTitle>
                </DialogHeader>
                {selectedStationId && (
                  <RadioScheduler
                    stationId={selectedStationId}
                    onScheduleCreated={() => setIsSchedulerOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="stations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stations">Live Stations</TabsTrigger>
            <TabsTrigger value="schedule">Show Schedule</TabsTrigger>
            <TabsTrigger value="create">Create Station</TabsTrigger>
          </TabsList>

          <TabsContent value="stations" className="mt-6">
            {stations && stations.length > 0 ? (
              <div className="grid gap-6">
                {stations.map((station) => (
                  <Card key={station.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <RadioIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{station.name}</h3>
                          <p className="text-muted-foreground">{station.description}</p>
                        </div>
                      </div>
                      {user && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScheduleShow(station.id)}
                          className="gap-2"
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Schedule
                        </Button>
                      )}
                    </div>
                    <RadioPlayer station={station} />
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-muted/50 p-4 rounded-full">
                    <RadioIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Stations Available</h3>
                    <p className="text-muted-foreground">
                      Create your first radio station to start broadcasting
                    </p>
                  </div>
                  {user && (
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Station
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Upcoming Shows</h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Schedule view coming soon</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Station</h3>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Station creation coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}