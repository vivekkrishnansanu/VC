'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { DayOfWeek } from '@/lib/mock-data/types';
import { Copy } from 'lucide-react';

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.MONDAY, label: 'Monday' },
  { value: DayOfWeek.TUESDAY, label: 'Tuesday' },
  { value: DayOfWeek.WEDNESDAY, label: 'Wednesday' },
  { value: DayOfWeek.THURSDAY, label: 'Thursday' },
  { value: DayOfWeek.FRIDAY, label: 'Friday' },
  { value: DayOfWeek.SATURDAY, label: 'Saturday' },
  { value: DayOfWeek.SUNDAY, label: 'Sunday' },
];

interface WorkingHoursStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export function WorkingHoursStep({ locationId, onComplete, skipRules }: WorkingHoursStepProps) {
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    daysOfWeek.map(day => ({
      day: day.value,
      isOpen: true,
      openTime: '09:00',
      closeTime: '17:00',
    }))
  );

  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const copyToOtherDays = (sourceIndex: number) => {
    const source = schedules[sourceIndex];
    const updated = schedules.map((schedule, index) => 
      index !== sourceIndex ? { ...schedule, ...source } : schedule
    );
    setSchedules(updated);
  };

  const onSubmit = async () => {
    console.log('Saving working hours:', schedules);
    onComplete();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Working Hours</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set operating hours for each day of the week
        </p>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <Card key={schedule.day}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={schedule.isOpen}
                    onCheckedChange={(checked) => 
                      handleDayChange(index, 'isOpen', checked)
                    }
                  />
                  <Label htmlFor={`day-${index}`} className="font-medium text-base">
                    {daysOfWeek[index].label}
                  </Label>
                </div>
                {schedule.isOpen && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToOtherDays(index)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Other Days
                  </Button>
                )}
              </div>

              {schedule.isOpen && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Open Time</Label>
                    <Input
                      type="time"
                      value={schedule.openTime}
                      onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Close Time</Label>
                    <Input
                      type="time"
                      value={schedule.closeTime}
                      onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="w-full sm:w-auto">Save & Continue</Button>
      </div>
    </form>
  );
}
