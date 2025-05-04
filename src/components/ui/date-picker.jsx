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

const DatePicker = ({
  form,
  name,
  label = "Date",
  futureAllowed = true,
  pastAllowed = true,
  design,
  withTime = false,
  isRequired = false,
}) => {
  const [selectedTime, setSelectedTime] = useState("12:00");

  const handleDateChange = (date) => {
    if (date) {
      let finalValue = formatISO(date, { representation: "date" });

      if (withTime) {
        const [hours, minutes] = selectedTime.split(":");
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0);
        finalValue = format(date, "yyyy-MM-dd'T'HH:mm:ss");
      }

      form.setValue(name, finalValue);
      form.trigger(name);
    }
  };

  const handleTimeChange = (event) => {
    const time = event.target.value;
    setSelectedTime(time);
    if (form.getValues(name)) {
      try {
        const date = new Date(form.getValues(name));
        const [hours, minutes] = time.split(":");
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0);
        form.setValue(name, format(date, "yyyy-MM-dd'T'HH:mm:ss"));
      } catch (error) {
        console.error("Invalid time value:", error);
      }
    }
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
          <div>
            <Popover modal={true}>
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
                      format(new Date(field.value), "MMM dd, yyyy - h:mm a")
                    ) : (
                      format(new Date(field.value), "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                {withTime && (
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={handleTimeChange}
                        className="border p-2 rounded-md w-full"
                      />
                    </div>
                  </div>
                )}
                <Calendar
                  mode="single"
                  captionLayout="dropdown-buttons"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={handleDateChange}
                  fromYear={1960}
                  toYear={addYears(new Date(), 5).getFullYear()}
                  disabled={disableDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePicker;
