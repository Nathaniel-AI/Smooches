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

        <Tabs defaultValue="podcasts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="schedule">Schedule Show</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="podcasts" className="mt-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <RadioIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Podcast Channel</h3>
                      <p className="text-muted-foreground">Create and monetize your podcast content</p>
                    </div>
                  </div>
                  {user && (
                    <Button className="gap-2" variant="default">
                      <Plus className="h-4 w-4" />
                      Upload Episode
                    </Button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Episode 1: Welcome to SMOOCHES</h4>
                    <p className="text-sm text-muted-foreground mb-3">Introduction to the platform and community</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">15 min</span>
                      <Button size="sm" variant="outline">Play</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Episode 2: Creator Tips</h4>
                    <p className="text-sm text-muted-foreground mb-3">How to build your audience and monetize</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">23 min</span>
                      <Button size="sm" variant="outline">Play</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg opacity-60">
                    <h4 className="font-semibold mb-2">Upload Your First Episode</h4>
                    <p className="text-sm text-muted-foreground mb-3">Start your podcast journey today</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">New</span>
                      <Button size="sm">Upload</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Schedule Live Podcast Recording</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Episode Title</label>
                    <input className="w-full p-2 border rounded-lg" placeholder="Episode 3: Advanced Creator Strategies" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Recording Date</label>
                    <input type="date" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time</label>
                      <input type="time" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>1.5 hours</option>
                        <option>2 hours</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Episode Description</label>
                    <textarea className="w-full p-2 border rounded-lg h-24" placeholder="Describe what this episode will cover..."></textarea>
                  </div>
                  <Button className="w-full">Schedule Recording</Button>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Monetization Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium Episode</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subscriber Only</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tip Jar Enabled</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="pt-2">
                      <label className="block text-sm font-medium mb-1">Episode Price</label>
                      <input type="number" className="w-full p-2 border rounded-lg" placeholder="$2.99" min="0" step="0.01" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="monetization" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Podcast Monetization</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">This Month</h4>
                  <div className="text-2xl font-bold text-primary">$127.50</div>
                  <p className="text-sm text-muted-foreground">+23% from last month</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Subscribers</h4>
                  <div className="text-2xl font-bold text-secondary">89</div>
                  <p className="text-sm text-muted-foreground">+12 new this week</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Total Episodes</h4>
                  <div className="text-2xl font-bold text-accent">15</div>
                  <p className="text-sm text-muted-foreground">2 episodes this month</p>
                </Card>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Revenue Streams</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Premium Episodes</h5>
                    <p className="text-sm text-muted-foreground mb-3">Charge for exclusive content</p>
                    <Button size="sm" variant="outline">Set Up</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Subscriptions</h5>
                    <p className="text-sm text-muted-foreground mb-3">Monthly recurring revenue</p>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Tips & Donations</h5>
                    <p className="text-sm text-muted-foreground mb-3">One-time supporter payments</p>
                    <Button size="sm" variant="outline">Enable</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Sponsorships</h5>
                    <p className="text-sm text-muted-foreground mb-3">Brand partnership opportunities</p>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Podcast Analytics</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-1">Total Plays</h4>
                  <div className="text-2xl font-bold">2,847</div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <h4 className="font-semibold mb-1">Avg. Listen Time</h4>
                  <div className="text-2xl font-bold">18:32</div>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="font-semibold mb-1">Completion Rate</h4>
                  <div className="text-2xl font-bold">67%</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-1">Top Episode</h4>
                  <div className="text-lg font-bold">Episode 2</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Episode Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Episode 2: Creator Tips</h5>
                      <p className="text-sm text-muted-foreground">1,234 plays • 72% completion</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">$45.60</div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Episode 1: Welcome to SMOOCHES</h5>
                      <p className="text-sm text-muted-foreground">987 plays • 65% completion</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">$28.90</div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}