import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

const ComboBox = ({ list, subject, value, onChange, styles, others }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredItems, setFilteredItems] = useState(list.slice(0, 200));
  const comboBoxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredItems(list.slice(0, 200));
    } else {
      const newFilteredItems = list
        .filter(item => item?.label?.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 200);
      setFilteredItems(newFilteredItems);
    }
  }, [inputValue, list]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (comboBoxRef.current && !comboBoxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="relative w-full" ref={comboBoxRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          styles,
          open ? "ring-2 ring-ring ring-offset-2" : ""
        )}
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {value ? list.find((item) => item.value === value)?.label : `Select ${subject}...`}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          {/* Search Input */}
          <div className="sticky top-0 border-b bg-background p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${subject}...`}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={inputValue}
              onChange={handleInputChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Items List */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredItems.length > 0 ? (
              <>
                {others && (
                  <div
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      others();
                      setOpen(false);
                    }}
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      <Check className="h-4 w-4 opacity-0" />
                    </span>
                    Others
                  </div>
                )}
                {filteredItems.map((item) => (
                  <div
                    key={item.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </span>
                    {item.label}
                  </div>
                ))}
              </>
            ) : (
              <div className="py-2 text-center text-sm text-muted-foreground">
                No {subject} found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default ComboBox;