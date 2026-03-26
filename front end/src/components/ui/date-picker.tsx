import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', disabled, className }: DatePickerProps) {
  const selected = value ? new Date(value + 'T00:00:00') : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(selected!, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={d => onChange(d ? format(d, 'yyyy-MM-dd') : '')}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
