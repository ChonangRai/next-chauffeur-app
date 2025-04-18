import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(new Date()));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate padding days to align first day of month
  const firstDayIndex = getDay(daysInMonth[0]);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date);
    }
  };

  return (
    <div className={cn("p-4 bg-background rounded-md shadow-sm w-[280px]", className)}>
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "size-7 p-0 flex items-center justify-center bg-transparent opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <h2 className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
        <button
          onClick={handleNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "size-7 p-0 flex items-center justify-center bg-transparent opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Weekday Headers */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Padding Days */}
        {paddingDays.map((_, i) => (
          <div key={`padding-${i}`} className="h-10" />
        ))}

        {/* Actual Days */}
        {daysInMonth.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => handleDateClick(day)}
            className={cn(
              "h-10 w-full flex items-center justify-center text-sm",
              isSameDay(day, selected || new Date(0)) ? "bg-primary text-primary-foreground rounded-md" : "hover:bg-accent",
              "focus:outline-none"
            )}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}

export { Calendar };