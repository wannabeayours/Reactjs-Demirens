import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatISO, format, addYears } from "date-fns";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const DatePicker = ({
  form,
  name,
  label = "Date",
  futureAllowed = true,
  pastAllowed = false,
  design,
  withTime = false,
  isRequired = false,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDateChange = (date) => {
    if (date) {
      let finalValue = format(date, "yyyy-MM-dd"); // Simple date format

      if (withTime) {
        // Keep existing time if already set
        const currentValue = form.getValues(name);
        if (currentValue) {
          try {
            const currentDate = new Date(currentValue);
            date.setHours(currentDate.getHours(), currentDate.getMinutes());
            finalValue = format(date, "yyyy-MM-dd HH:mm:ss"); // Space instead of T
          } catch {
            // If time isn't set yet, use current time
            date.setHours(12, 0);
            finalValue = format(date, "yyyy-MM-dd HH:mm:ss"); // Space instead of T
          }
        } else {
          // Default to 12:00 if no time set
          date.setHours(12, 0);
          finalValue = format(date, "yyyy-MM-dd HH:mm:ss"); // Space instead of T
        }
      }

      form.setValue(name, finalValue);
      form.trigger(name);
    }
  };

  const handleTimeChange = (type, value) => {
    const currentDate = form.getValues(name) ? new Date(form.getValues(name)) : new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour12 = parseInt(value, 10);
      const currentHour24 = newDate.getHours();
      const isPM = currentHour24 >= 12;

      let hour24;
      if (hour12 === 12) {
        hour24 = isPM ? 12 : 0;
      } else {
        hour24 = isPM ? hour12 + 12 : hour12;
      }
      newDate.setHours(hour24);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue(name, format(newDate, "yyyy-MM-dd HH:mm:ss")); // Space instead of T
    form.trigger(name);
  };


  const disableDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveYearsFromNow = addYears(today, 5);
    if (futureAllowed && pastAllowed) return date > fiveYearsFromNow;
    if (!futureAllowed && date > today) return true;
    if (!pastAllowed && date < today) return true;
    return date > fiveYearsFromNow;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {isRequired && <span className="text-red-500"> *</span>}
          </FormLabel>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Popover
                modal={true}
                open={isPopoverOpen}
                onOpenChange={(open) => {
                  setIsPopoverOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      design ? design : "justify-start w-full",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      withTime ? (
                        format(new Date(field.value), "MMM dd, yyyy hh:mm a")
                      ) : (
                        format(new Date(field.value), "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <div className={withTime ? "sm:flex" : ""}>
                    <Calendar
                      mode="single"
                      captionLayout="dropdown-buttons"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        handleDateChange(date);
                        if (!withTime) setIsPopoverOpen(false);
                      }}
                      fromYear={1960}
                      toYear={addYears(new Date(), 5).getFullYear()}
                      disabled={disableDate}
                    />
                    {withTime && (
                      <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 12 }, (_, i) => i + 1)
                              .reverse()
                              .map((hour) => (
                                <Button
                                  key={hour}
                                  size="icon"
                                  variant={
                                    field.value &&
                                      new Date(field.value).getHours() % 12 === hour % 12
                                      ? "default"
                                      : "ghost"
                                  }
                                  className="sm:w-full shrink-0 aspect-square"
                                  onClick={() =>
                                    handleTimeChange("hour", hour.toString())
                                  }
                                >
                                  {hour}
                                </Button>
                              ))}
                          </div>
                          <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(
                              (minute) => (
                                <Button
                                  key={minute}
                                  size="icon"
                                  variant={
                                    field.value &&
                                      new Date(field.value).getMinutes() === minute
                                      ? "default"
                                      : "ghost"
                                  }
                                  className="sm:w-full shrink-0 aspect-square"
                                  onClick={() =>
                                    handleTimeChange("minute", minute.toString())
                                  }
                                >
                                  {minute.toString().padStart(2, "0")}
                                </Button>
                              )
                            )}
                          </div>
                          <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="">
                          <div className="flex sm:flex-col p-2">
                            {["AM", "PM"].map((ampm) => (
                              <Button
                                key={ampm}
                                size="icon"
                                variant={
                                  field.value &&
                                    ((ampm === "AM" &&
                                      new Date(field.value).getHours() < 12) ||
                                      (ampm === "PM" &&
                                        new Date(field.value).getHours() >= 12))
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange("ampm", ampm)}
                              >
                                {ampm}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePicker;