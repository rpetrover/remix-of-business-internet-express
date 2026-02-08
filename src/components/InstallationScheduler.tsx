import { useState } from 'react';
import { format, isSunday, isAfter, startOfDay, addDays } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// US Federal Holidays (month is 0-indexed)
const getHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];

  // New Year's Day – Jan 1
  holidays.push(new Date(year, 0, 1));
  // MLK Day – 3rd Monday of January
  holidays.push(getNthWeekday(year, 0, 1, 3));
  // Presidents' Day – 3rd Monday of February
  holidays.push(getNthWeekday(year, 1, 1, 3));
  // Memorial Day – last Monday of May
  holidays.push(getLastWeekday(year, 4, 1));
  // Juneteenth – Jun 19
  holidays.push(new Date(year, 5, 19));
  // Independence Day – Jul 4
  holidays.push(new Date(year, 6, 4));
  // Labor Day – 1st Monday of September
  holidays.push(getNthWeekday(year, 8, 1, 1));
  // Columbus Day – 2nd Monday of October
  holidays.push(getNthWeekday(year, 9, 1, 2));
  // Veterans Day – Nov 11
  holidays.push(new Date(year, 10, 11));
  // Thanksgiving – 4th Thursday of November
  holidays.push(getNthWeekday(year, 10, 4, 4));
  // Christmas Day – Dec 25
  holidays.push(new Date(year, 11, 25));

  return holidays;
};

function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) break;
    if (d.getDay() === weekday) {
      count++;
      if (count === n) return d;
    }
  }
  return new Date(year, month, 1);
}

function getLastWeekday(year: number, month: number, weekday: number): Date {
  let last = new Date(year, month, 1);
  for (let day = 1; day <= 31; day++) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) break;
    if (d.getDay() === weekday) last = d;
  }
  return last;
}

const isHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const holidays = getHolidays(year);
  return holidays.some(
    (h) => h.getFullYear() === year && h.getMonth() === date.getMonth() && h.getDate() === date.getDate()
  );
};

const isDisabledDate = (date: Date): boolean => {
  const tomorrow = startOfDay(addDays(new Date(), 1));
  if (!isAfter(date, tomorrow) && startOfDay(date).getTime() !== tomorrow.getTime()) return true;
  if (isSunday(date)) return true;
  if (isHoliday(date)) return true;
  return false;
};

// Generate time slots from 8 AM to 7 PM
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
  const hour = 8 + i;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour}:00`,
    label: `${displayHour}:00 ${ampm}`,
  };
});

export interface InstallationSelection {
  date: Date | undefined;
  time: string;
}

interface InstallationSchedulerProps {
  primary: InstallationSelection;
  secondary: InstallationSelection;
  onPrimaryChange: (selection: InstallationSelection) => void;
  onSecondaryChange: (selection: InstallationSelection) => void;
  errors?: { primaryDate?: string; primaryTime?: string; secondaryDate?: string; secondaryTime?: string };
}

const DateTimePicker = ({
  label,
  selection,
  onChange,
  dateError,
  timeError,
  idPrefix,
}: {
  label: string;
  selection: InstallationSelection;
  onChange: (s: InstallationSelection) => void;
  dateError?: string;
  timeError?: string;
  idPrefix: string;
}) => {
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-foreground">{label}</h4>
      <div className="grid grid-cols-2 gap-3">
        {/* Date picker */}
        <div>
          <Label htmlFor={`${idPrefix}-date`} className="text-xs text-muted-foreground mb-1 block">
            Date
          </Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id={`${idPrefix}-date`}
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selection.date && 'text-muted-foreground',
                  dateError && 'border-destructive'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selection.date ? format(selection.date, 'MMM d, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selection.date}
                onSelect={(date) => {
                  onChange({ ...selection, date });
                  setDateOpen(false);
                }}
                disabled={isDisabledDate}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
              <p className="px-3 pb-2 text-xs text-muted-foreground">
                Sundays &amp; national holidays are unavailable.
              </p>
            </PopoverContent>
          </Popover>
          {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}
        </div>

        {/* Time picker */}
        <div>
          <Label htmlFor={`${idPrefix}-time`} className="text-xs text-muted-foreground mb-1 block">
            Time
          </Label>
          <Select
            value={selection.time}
            onValueChange={(value) => onChange({ ...selection, time: value })}
          >
            <SelectTrigger
              id={`${idPrefix}-time`}
              className={cn(timeError && 'border-destructive')}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Pick a time" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeError && <p className="text-xs text-destructive mt-1">{timeError}</p>}
        </div>
      </div>
    </div>
  );
};

const InstallationScheduler = ({
  primary,
  secondary,
  onPrimaryChange,
  onSecondaryChange,
  errors,
}: InstallationSchedulerProps) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-primary" />
        Preferred Installation Schedule
      </h3>
      <p className="text-sm text-muted-foreground -mt-2">
        Select your preferred and backup installation date &amp; time. Available Monday–Saturday, 8 AM – 7 PM.
      </p>

      <DateTimePicker
        label="1st Choice"
        selection={primary}
        onChange={onPrimaryChange}
        dateError={errors?.primaryDate}
        timeError={errors?.primaryTime}
        idPrefix="install-primary"
      />

      <DateTimePicker
        label="2nd Choice (Backup)"
        selection={secondary}
        onChange={onSecondaryChange}
        dateError={errors?.secondaryDate}
        timeError={errors?.secondaryTime}
        idPrefix="install-secondary"
      />
    </div>
  );
};

export default InstallationScheduler;
