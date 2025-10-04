/**
 * NumberFormatter Utility Class
 * A comprehensive utility class for formatting numbers with thousands separators
 * and various currency/number display options for admin pages
 */
export class NumberFormatter {
  /**
   * Default configuration for formatting
   */
  static defaults = {
    locale: 'en-PH',
    currency: 'PHP',
    symbol: '₱',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  };

  /**
   * Format a number with thousands separators
   * @param {string|number} value - The number to format
   * @param {Object} options - Formatting options
   * @param {boolean} options.showCurrency - Whether to show currency symbol
   * @param {number} options.minimumFractionDigits - Minimum decimal places
   * @param {number} options.maximumFractionDigits - Maximum decimal places
   * @param {string} options.locale - Locale for formatting
   * @returns {string} Formatted number string
   */
  static formatNumber(value, options = {}) {
    try {
      // Handle null, undefined, or empty values
      if (value === null || value === undefined || value === '') {
        return '0';
      }

      // Convert to number
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      
      // Handle NaN or invalid numbers
      if (isNaN(numValue)) {
        return '0';
      }

      // Configuration
      const config = {
        locale: options.locale || this.defaults.locale,
        minimumFractionDigits: options.minimumFractionDigits !== undefined 
          ? options.minimumFractionDigits 
          : this.defaults.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits !== undefined 
          ? options.maximumFractionDigits 
          : this.defaults.maximumFractionDigits,
        showCurrency: options.showCurrency || false
      };

      // Format the number
      let formattedNumber = numValue.toLocaleString(config.locale, {
        minimumFractionDigits: config.minimumFractionDigits,
        maximumFractionDigits: config.maximumFractionDigits
      });

      // Add currency symbol if requested
      if (config.showCurrency) {
        formattedNumber = `${this.defaults.symbol}${formattedNumber}`;
      }

      return formattedNumber;
    } catch (error) {
      console.error('NumberFormatter.formatNumber() error:', error);
      return `${this.defaults.symbol}0`;
    }
  }

  /**
   * Format currency with thousands separators (commonly used method)
   * @param {string|number} value - The number to format
   * @param {Object} options - Additional options
   * @returns {string} Formatted currency string
   */
  static formatCurrency(value, options = {}) {
    return this.formatNumber(value, {
      ...options,
      showCurrency: true
    });
  }

  /**
   * Format currency without decimal places (for whole amounts)
   * @param {string|number} value - The number to format
   * @param {Object} options - Additional options
   * @returns {string} Formatted currency string without decimals
   */
  static formatCurrencyWhole(value, options = {}) {
    return this.formatNumber(value, {
      ...options,
      showCurrency: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Format currency with specific decimal places
   * @param {string|number} value - The number to format
   * @param {number} decimals - Number of decimal places
   * @param {Object} options - Additional options
   * @returns {string} Formatted currency string
   */
  static formatCurrencyDecimals(value, decimals = 2, options = {}) {
    return this.formatNumber(value, {
      ...options,
      showCurrency: true,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Format number without currency symbol (just with thousands separators)
   * @param {string|number} value - The number to format
   * @param {Object} options - Additional options
   * @returns {string} Formatted number string
   */
  static formatNumberOnly(value, options = {}) {
    return this.formatNumber(value, {
      ...options,
      showCurrency: false
    });
  }

  /**
   * Format large numbers with abbreviations (K, M, B)
   * @param {string|number} value - The number to format
   * @param {Object} options - Additional options
   * @returns {string} Formatted abbreviated number string
   */
  static formatAbbreviated(value, options = {}) {
    const formatOptions = {
      decimals: options.decimals || 1,
      showCurrency: options.showCurrency || false
    };

    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      
      if (isNaN(numValue)) {
        return formatOptions.showCurrency ? `${this.defaults.symbol}0` : '0';
      }

      let formattedValue;
      const absValue = Math.abs(numValue);

      if (absValue >= 1e9) {
        formattedValue = (numValue / 1e9).toFixed(formatOptions.decimals) + 'B';
      } else if (absValue >= 1e6) {
        formattedValue = (numValue / 1e6).toFixed(formatOptions.decimals) + 'M';
      } else if (absValue >= 1e3) {
        formattedValue = (numValue / 1e3).toFixed(formatOptions.decimals) + 'K';
      } else {
        formattedValue = numValue.toFixed(formatOptions.decimals);
      }

      return formatOptions.showCurrency ? `${this.defaults.symbol}${formattedValue}` : formattedValue;
    } catch (error) {
      console.error('NumberFormatter.formatAbbreviated() error:', error);
      return formatOptions.showCurrency ? `${this.defaults.symbol}0` : '0';
    }
  }

  /**
   * Format percentage with decimal places
   * @param {string|number} value - The percentage value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  static formatPercentage(value, decimals = 2) {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      
      if (isNaN(numValue)) {
        return '0.00%';
      }

      return `${numValue.toFixed(decimals)}%`;
    } catch (error) {
      console.error('NumberFormatter.formatPercentage() error:', error);
      return '0.00%';
    }
  }

  /**
   * Format count/number with thousands separators (no decimals)
   * @param {string|number} value - The number to format
   * @returns {string} Formatted count string
   */
  static formatCount(value) {
    return this.formatNumber(value, {
      showCurrency: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Parse and validate currency input from user
   * @param {string} input - User input string
   * @returns {number} Parsed number or 0 if invalid
   */
  static parseCurrencyInput(input) {
    try {
      // Remove currency symbol and clean input
      const cleaned = String(input).replace(/[₱$,]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.error('NumberFormatter.parseCurrencyInput() error:', error);
      return 0;
    }
  }

  /**
   * Format array of numbers to consistent format
   * @param {Array} numbers - Array of numbers to format
   * @param {string} method - Formatting method ('currency', 'number', 'count')
   * @returns {Array} Array of formatted number strings
   */
  static formatArray(numbers, method = 'currency') {
    if (!Array.isArray(numbers)) {
      return [];
    }

    const formatMethod = {
      'currency': this.formatCurrency,
      'number': this.formatNumberOnly,
      'count': this.formatCount,
      'abbreviated': this.formatAbbreviated
    }[method] || this.formatCurrency;

    return numbers.map(num => formatMethod(num));
  }

  /**
   * Format table data for consistent number display
   * @param {Object} rowData - Data row object
   * @param {Array} numberFields - Fields that contain numbers
   * @param {string} method - Formatting method
   * @returns {Object} Formatted row data
   */
  static formatTableRow(rowData, numberFields = [], method = 'currency') {
    const formatted = { ...rowData };
    
    numberFields.forEach(field => {
      if (formatted[field] !== undefined) {
        formatted[field] = this.formatCurrency(formatted[field]);
      }
    });

    return formatted;
  }
}

/**
 * Convenience functions for direct import
 */
export const {
  formatNumber,
  formatCurrency,
  formatCurrencyWhole,
  formatCurrencyDecimals,
  formatNumberOnly,
  formatAbbreviated,
  formatPercentage,
  formatCount,
  parseCurrencyInput,
  formatArray,
  formatTableRow
} = NumberFormatter;

// Default export
export default NumberFormatter;
