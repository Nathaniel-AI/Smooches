import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toDate } from "date-fns-tz";

interface ReviewStepProps {
  data: {
    timeZone: string;
    showName: string;
    description: string;
    startTime: Date;
    endTime: Date;
    isRecurring: boolean;
    recurringDays: string[];
  };
  onNext: (data: any) => void;
}

export function ReviewStep({ data, onNext }: ReviewStepProps) {
  // Convert UTC times to zoned times for display
  const zonedStartTime = toDate(data.startTime, { timeZone: data.timeZone });
  const zonedEndTime = toDate(data.endTime, { timeZone: data.timeZone });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Review Schedule</h2>
        <p className="text-muted-foreground">
          Please review your show details before confirming.
        </p>
      </div>

      <div className="space-y-4 bg-accent/50 p-4 rounded-lg">
        <div>
          <h3 className="font-semibold">Show Name</h3>
          <p>{data.showName}</p>
        </div>

        <div>
          <h3 className="font-semibold">Description</h3>
          <p>{data.description}</p>
        </div>

        <div>
          <h3 className="font-semibold">Time Zone</h3>
          <p>{data.timeZone.replace(/_/g, " ")}</p>
        </div>

        <div>
          <h3 className="font-semibold">Time</h3>
          <p>
            {format(zonedStartTime, "h:mm a")} - {format(zonedEndTime, "h:mm a")}
          </p>
        </div>

        {data.isRecurring && (
          <div>
            <h3 className="font-semibold">Repeats On</h3>
            <p>{data.recurringDays.join(", ")}</p>
          </div>
        )}
      </div>

      <Button
        onClick={() => onNext(data)}
        className="w-full md:w-auto"
      >
        Confirm Schedule
      </Button>
    </div>
  );
}