import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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

    const showName = formData.get("showName") as string;
    const description = formData.get("description") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;

    // Create Date objects in the user's time zone
    const today = new Date();
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startHours,
      startMinutes
    );

    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endHours,
      endMinutes
    );

    // If end time is earlier than start time, assume it's for the next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    onNext({
      showName,
      description,
      startTime: startDate,
      endTime: endDate
    });
  };

  // Convert times to local timezone for display
  const localStartTime = toZonedTime(data.startTime, data.timeZone);
  const localEndTime = toZonedTime(data.endTime, data.timeZone);

  // Format times for display
  const startTimeStr = format(localStartTime, 'HH:mm');
  const endTimeStr = format(localEndTime, 'HH:mm');

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
              defaultValue={startTimeStr}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={endTimeStr}
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