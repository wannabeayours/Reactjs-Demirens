import { clsx} from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(dateString, formatString = "MMM dd, yyyy") {
  if (!dateString) return "N/A";
  
  try {
    // Try to parse the date string
    let date;
    if (typeof dateString === 'string') {
      // Handle various date formats that might come from the database
      if (dateString.includes('T')) {
        date = parseISO(dateString);
      } else if (dateString.includes(' ')) {
        // Handle formats like "2024-01-15 14:30:00"
        date = new Date(dateString);
      } else {
        // Handle formats like "2024-01-15"
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    if (!isValid(date)) {
      return "Invalid Date";
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return "Invalid Date";
  }
}

export function formatDateTime(dateString) {
  return formatDate(dateString, "MMM dd, yyyy 'at' h:mm a");
}

export function formatDateOnly(dateString) {
  return formatDate(dateString, "MMM dd, yyyy");
}

export function formatTimeOnly(dateString) {
  return formatDate(dateString, "h:mm a");
}
