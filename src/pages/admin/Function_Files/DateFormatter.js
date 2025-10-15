/**
 * DateFormatter Utility Class
 * A comprehensive utility class for formatting dates consistently across admin pages
 */
export class DateFormatter {
  /**
   * Default configuration for formatting
   */
  static defaults = {
    locale: 'en-US',
    timeZone: 'Asia/Manila',
    dateFormat: 'MMM dd, yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'MMM dd, yyyy HH:mm',
    shortDateFormat: 'MM/dd/yyyy',
    longDateFormat: 'MMMM dd, yyyy'
  };

  /**
   * Format a date with specified options
   * @param {Date|string} dateValue - The date to format
   * @param {Object} options - Formatting options
   * @param {string} options.locale - Locale for formatting
   * @param {string} options.timeZone - Time zone for formatting
   * @param {boolean} options.dateOnly - Show only date (no time)
   * @param {boolean} options.timeOnly - Show only time (no date)
   * @param {string} options.format - Custom format string
   * @returns {string} Formatted date string
   */
  static formatDate(dateValue, options = {}) {
    try {
      // Handle null, undefined, or empty values
      if (!dateValue) {
        return 'N/A';
      }

      // Convert to Date object
      let date = dateValue;
      if (typeof dateValue === 'string') {
        // Handle common date string formats
        if (dateValue.includes('T')) {
          // ISO string
          date = new Date(dateValue);
        } else if (dateValue.includes('/')) {
          // US format MM/DD/YYYY or DD/MM/YYYY
          date = new Date(dateValue);
        } else if (dateValue.includes('-')) {
          // ISO date YYYY-MM-DD
          date = new Date(dateValue + (dateValue.includes(':') ? '' : 'T00:00:00'));
        } else {
          date = new Date(dateValue);
        }
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // Configuration
      const config = {
        locale: options.locale || this.defaults.locale,
        timeZone: options.timeZone || this.defaults.timeZone,
        dateOnly: options.dateOnly || false,
        timeOnly: options.timeOnly || false,
        format: options.format || null
      };

      let formattedDate;

      if (config.format) {
        // Custom format handling
        formattedDate = this.formatWithCustomFormat(date, config.format);
      } else if (config.dateOnly) {
        // Date only formatting
        formattedDate = this._formatDateOnlyHelper(date, config);
      } else if (config.timeOnly) {
        // Time only formatting
        formattedDate = this._formatTimeOnlyHelper(date, config);
      } else {
        // Default date and time formatting
        formattedDate = this.formatDateTime(date, config);
      }

      return formattedDate;
    } catch (error) {
      console.error('DateFormatter.formatDate() error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format date only (no time)
   * @param {Date|string} dateValue - The date to format
   * @param {Object} options - Additional options
   * @returns {string} Formatted date string
   */
  static formatDateOnly(dateValue, options = {}) {
    const config = {
      locale: options.locale || this.defaults.locale,
      timeZone: options.timeZone || this.defaults.timeZone
    };
    
    try {
      let date = dateValue;
      if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return this._formatDateOnlyHelper(date, config);
    } catch (error) {
      console.error('DateFormatter.formatDateOnly() error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format time only (no date)
   * @param {Date|string} dateValue - The date to format
   * @param {Object} options - Additional options
   * @returns {string} Formatted time string
   */
  static formatTimeOnly(dateValue, options = {}) {
    const config = {
      locale: options.locale || this.defaults.locale,
      timeZone: options.timeZone || this.defaults.timeZone
    };
    
    try {
      let date = dateValue;
      if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return this._formatTimeOnlyHelper(date, config);
    } catch (error) {
      console.error('DateFormatter.formatTimeOnly() error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format short date (MM/DD/YYYY)
   * @param {Date|string} dateValue - The date to format
   * @returns {string} Formatted short date string
   */
  static formatShortDate(dateValue) {
    try {
      const normalized = typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;
      const date = typeof normalized === 'string' ? new Date(normalized) : new Date(normalized);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString(this.defaults.locale, {
        timeZone: this.defaults.timeZone,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('DateFormatter.formatShortDate() error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format long date (Month DD, YYYY)
   * @param {Date|string} dateValue - The date to format
   * @returns {string} Formatted long date string
   */
  static formatLongDate(dateValue) {
    try {
      const normalized = typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;
      const date = typeof normalized === 'string' ? new Date(normalized) : new Date(normalized);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString(this.defaults.locale, {
        timeZone: this.defaults.timeZone,
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('DateFormatter.formatLongDate() error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format relative date (Today, Yesterday, X days ago)
   * @param {Date|string} dateValue - The date to format
   * @returns {string} Formatted relative date string
   */
  static formatRelativeDate(dateValue) {
    try {
      const date = new Date(dateValue);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays === -1) {
        return 'Tomorrow';
      } else if (diffDays > 0) {
        return `${diffDays} days ago`;
      } else {
        return `In ${Math.abs(diffDays)} days`;
      }
    } catch (error) {
      console.error('DateFormatter.formatRelativeDate() error:', error);
      return 'N/A';
    }
  }

  /**
   * Format date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date range string
   */
  static formatDateRange(startDate, endDate, options = {}) {
    try {
      const start = this.formatDateOnly(startDate, options);
      const end = this.formatDateOnly(endDate, options);
      
      return `${start} - ${end}`;
    } catch (error) {
      console.error('DateFormatter.formatDateRange() error:', error);
      return 'N/A';
    }
  }

  /**
   * Format compact date (MM/DD/YY)
   * @param {Date|string} dateValue - The date to format
   * @returns {string} Formatted compact date string
   */
  static formatCompactDate(dateValue) {
    return this.formatDate(dateValue, { format: 'compact' });
  }

  /**
   * Format for table display (responsive)
   * @param {Date|string} dateValue - The date to format
   * @returns {Object} Object with responsive date strings
   */
  static formatForTable(dateValue) {
    return {
      mobile: this.formatCompactDate(dateValue),
      desktop: this.formatDateOnly(dateValue),
      full: this.formatDate(dateValue)
    };
  }

  /**
   * Get current Philippines date
   * @returns {Date} Current date in Philippines timezone
   */
  static getCurrentPhilippinesDate() {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
  }

  /**
   * Compare dates
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {number} Difference in milliseconds
   */
  static compareDates(date1, date2) {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return d1.getTime() - d2.getTime();
    } catch (error) {
      console.error('DateFormatter.compareDates() error:', error);
      return 0;
    }
  }

  /**
   * Check if date is today
   * @param {Date|string} dateValue - The date to check
   * @returns {boolean} True if date is today
   */
  static isToday(dateValue) {
    try {
      const date = new Date(dateValue);
      const today = new Date();
      
      return date.getFullYear() === today.getFullYear() &&
             date.getMonth() === today.getMonth() &&
             date.getDate() === today.getDate();
    } catch (error) {
      console.error('DateFormatter.isToday() error:', error);
      return false;
    }
  }

  /**
   * Check if date is in the past
   * @param {Date|string} dateValue - The date to check
   * @returns {boolean} True if date is in the past
   */
  static isPast(dateValue) {
    try {
      const date = new Date(dateValue);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day
      date.setHours(0, 0, 0, 0); // Reset time to start of day
      
      return date < now;
    } catch (error) {
      console.error('DateFormatter.isPast() error:', error);
      return false;
    }
  }

  /**
   * Check if date is in the future
   * @param {Date|string} dateValue - The date to check
   * @returns {boolean} True if date is in the future
   */
  static isFuture(dateValue) {
    try {
      const date = new Date(dateValue);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day
      date.setHours(0, 0, 0, 0); // Reset time to start of day
      
      return date > now;
    } catch (error) {
      console.error('DateFormatter.isFuture() error:', error);
      return false;
    }
  }

  /**
   * Helper method for custom format formatting
   * @param {Date} date - Date object
   * @param {string} format - Format string
   * @returns {string} Formatted string
   */
  static formatWithCustomFormat(date, format) {
    const locale = this.defaults.locale;
    const timeZone = this.defaults.timeZone;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (format) {
      case 'shortDate':
        return date.toLocaleDateString(locale, {
          timeZone,
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      case 'longDate':
        return date.toLocaleDateString(locale, {
          timeZone,
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      case 'compact':
        return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
      default:
        return date.toLocaleDateString(locale, { timeZone });
    }
  }

  /**
   * Helper method for date-only formatting
   * @ private
   * @param {Date} date - Date object
   * @param {Object} config - Configuration
   * @returns {string} Formatted date string
   */
  static _formatDateOnlyHelper(date, config) {
    return date.toLocaleDateString(config.locale, {
      timeZone: config.timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Helper method for time-only formatting
   * @private
   * @param {Date} date - Date object
   * @param {Object} config - Configuration
   * @returns {string} Formatted time string
   */
  static _formatTimeOnlyHelper(date, config) {
    return date.toLocaleTimeString(config.locale, {
      timeZone: config.timeZone,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Helper method for date and time formatting
   * @param {Date} date - Date object
   * @param {Object} config - Configuration
   * @returns {string} Formatted date and time string
   */
  static formatDateTime(date, config) {
    const datePart = date.toLocaleDateString(config.locale, {
      timeZone: config.timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timePart = date.toLocaleTimeString(config.locale, {
      timeZone: config.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${datePart} at ${timePart}`;
  }

  /**
   * Parse input date from various formats
   * @param {string} input - User input string
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDateInput(input) {
    try {
      const cleaned = String(input).trim();
      if (!cleaned) return null;
      
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) return null;
      
      return date;
    } catch (error) {
      console.error('DateFormatter.parseDateInput() error:', error);
      return null;
    }
  }

  /**
   * Format array of dates consistently
   * @param {Array} dates - Array of dates to format
   * @param {string} method - Formatting method ('date', 'time', 'compact')
   * @returns {Array} Array of formatted date strings
   */
  static formatArray(dates, method = 'date') {
    if (!Array.isArray(dates)) {
      return [];
    }

    const formatMethod = {
      'date': this.formatDateOnly,
      'time': this.formatTimeOnly,
      'compact': this.formatCompactDate,
      'long': this.formatLongDate,
      'relative': this.formatRelativeDate
    }[method] || this.formatDateOnly;

    return dates.map(date => formatMethod(date));
  }
}

/**
 * Convenience functions for direct import
 */
export const {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatShortDate,
  formatLongDate,
  formatRelativeDate,
  formatDateRange,
  formatCompactDate,
  formatForTable,
  getCurrentPhilippinesDate,
  compareDates,
  isToday,
  isPast,
  isFuture,
  parseDateInput,
  formatArray
} = DateFormatter;

// Default export
export default DateFormatter;
