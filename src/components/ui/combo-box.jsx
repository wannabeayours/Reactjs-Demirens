import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const ComboBox = ({ list, subject, value, onChange, styles, others }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredItems, setFilteredItems] = useState(list.slice(0, 200));
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredItems(list.slice(0, 200));
    }
  }, [inputValue, list]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue === '') {
      setFilteredItems(list.slice(0, 200));
    } else {
      const newFilteredItems = list
        .filter(item => item?.label?.toLowerCase().includes(newInputValue.toLowerCase()))
        .slice(0, 200);
      setFilteredItems(newFilteredItems);
    }
  };

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += event.deltaY;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between", 
            !styles ? "bg-[#0e4028] border-2 border-[#0b864a] hover:bg-[#0e5a35]" : styles
          )}
        >
          <span className="truncate">
            {value ? list.find((item) => item.value === value)?.label : `Select ${subject}...`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-75" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const isCombobox = e.target.closest('[role="combobox"]');
          if (isCombobox) {
            e.preventDefault();
          }
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={handleInputChange}
            placeholder={`Search ${subject}...`}
            className="focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
          <CommandList
            ref={scrollRef}
            onWheel={handleWheel}
          >
            <CommandEmpty>No {subject} found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.length > 0 ? (
                <>
                  {others && (
                    <CommandItem
                      onSelect={() => {
                        others();
                        setOpen(false);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      Others
                    </CommandItem>
                  )}
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </>
              ) : (
                <CommandEmpty>No items found.</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;