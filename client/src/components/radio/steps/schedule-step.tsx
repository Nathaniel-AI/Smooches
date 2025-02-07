import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, parse, addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";

interface ScheduleStepProps {
  data: {
    timeZone: string;
    showName: string;
    description: string;
    startTime: Date;
    endTime: Date;
  };
  onNext: (data: any) => void;
}

export function ScheduleStep({ data, onNext }: ScheduleStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Get the time strings from the form
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;

    // Create base date objects for today
    const today = new Date();
    const startDate = parse(startTimeStr, "HH:mm", today);
    const endDate = parse(endTimeStr, "HH:mm", today);

    // If end time is before start time, assume it's for the next day
    const adjustedEndDate = endDate < startDate ? addDays(endDate, 1) : endDate;

    onNext({
      showName: formData.get("showName"),
      description: formData.get("description"),
      startTime: startDate,
      endTime: adjustedEndDate
    });
  };

  // Format times for display in the selected time zone
  const displayStartTime = data.startTime ? formatInTimeZone(data.startTime, data.timeZone, "HH:mm") : "00:00";
  const displayEndTime = data.endTime ? formatInTimeZone(data.endTime, data.timeZone, "HH:mm") : "01:00";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Schedule Your Show</h2>
        <p className="text-muted-foreground">
          Set up the details and timing for your radio show.
          Times will be displayed in {data.timeZone.replace(/_/g, " ")}.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="showName">Show Name</Label>
          <Input
            id="showName"
            name="showName"
            placeholder="Enter your show name"
            defaultValue={data.showName}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell other creators what your show is about"
            defaultValue={data.description}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={displayStartTime}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={displayEndTime}
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        Continue
      </Button>
    </form>
  );
}