import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TimeZoneStep } from "./steps/time-zone-step";
import { ScheduleStep } from "./steps/schedule-step";
import { RecurrenceStep } from "./steps/recurrence-step";
import { ReviewStep } from "./steps/review-step";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RadioSchedule } from "@shared/schema";

interface SchedulingWizardProps {
  stationId: number;
  onComplete: () => void;
}

export function SchedulingWizard({ stationId, onComplete }: SchedulingWizardProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [schedule, setSchedule] = useState({
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    showName: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    isRecurring: false,
    recurringDays: [] as string[]
  });

  const steps = [
    TimeZoneStep,
    ScheduleStep,
    RecurrenceStep,
    ReviewStep
  ];

  const CurrentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async (data: any) => {
    setSchedule(prev => ({ ...prev, ...data }));
    
    if (step === steps.length - 1) {
      try {
        // Convert times to UTC before sending to server
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);

        await apiRequest('POST', '/api/radio-schedules', {
          stationId,
          showName: schedule.showName,
          description: schedule.description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isRecurring: schedule.isRecurring,
          recurringDays: schedule.recurringDays
        });

        toast({
          title: "Success",
          description: "Radio show scheduled successfully!",
        });

        onComplete();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to schedule radio show. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  return (
    <Card className="w-full max-w-2xl p-6 space-y-6">
      <Progress value={progress} className="w-full" />

      <CurrentStep 
        data={schedule}
        onNext={handleNext}
      />

      <div className="flex justify-between pt-4">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
          >
            Back
          </Button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">
          Step {step + 1} of {steps.length}
        </span>
      </div>
    </Card>
  );
}
