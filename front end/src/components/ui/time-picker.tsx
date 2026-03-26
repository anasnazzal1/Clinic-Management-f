import * as React from 'react';
import { Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    TIME_SLOTS.push(`${hh}:${mm}`);
  }
}

interface TimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minTime?: string; // HH:mm — slots before this are disabled
}

export function TimePicker({ value, onChange, placeholder = 'Select time', className, minTime }: TimePickerProps) {
  const slots = minTime ? TIME_SLOTS.filter(t => t > minTime) : TIME_SLOTS;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {slots.map(t => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
