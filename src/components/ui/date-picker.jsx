import { format } from "date-fns";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "./input";

const DatePicker = ({
  form,
  name,
  label = "Date",
  placeholder = "Pick a date",
  withTime = false,
  isRequired = false,
  pastAllowed = true,
  futureAllowed = true,
}) => {
  const now = new Date();
  const formattedNow = withTime
    ? format(now, "yyyy-MM-dd'T'HH:mm")
    : format(now, "yyyy-MM-dd");

  // Optional boundaries
  const min = !pastAllowed ? formattedNow : undefined;
  const max = !futureAllowed ? formattedNow : undefined;

  const handleChange = (e) => {
    const value = e.target.value;
    const parsedDate = new Date(value);
    const formattedValue = withTime
      ? format(parsedDate, "yyyy-MM-dd HH:mm:ss")
      : format(parsedDate, "yyyy-MM-dd");
    form.setValue(name, formattedValue);
    form.trigger(name);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </FormLabel>
          <Input
            type={withTime ? "datetime-local" : "date"}
            value={field.value ? field.value.substring(0, withTime ? 16 : 10) : ""}
            onChange={handleChange}
            min={min}
            max={max}
            className="border rounded px-3 py-2 w-full"
            placeholder={placeholder}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePicker;
