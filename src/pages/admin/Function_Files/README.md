# Admin Utility Functions

This folder contains reusable utility classes for the admin panel to ensure consistency across all pages.

## 🔧 NumberFormatter

Handles all number formatting with thousands separators and currency symbols.

### Usage Examples:

```javascript
import { NumberFormatter } from './Function_Files/NumberFormatter'

// Currency formatting
<span>{NumberFormatter.formatCurrency(2500000)}</span>        // ₱2,500,000.00
<span>{NumberFormatter.formatCount(1500)}</span>             // 1,500
<span>{NumberFormatter.formatCurrencyWhole(5000)}</span>       // ₱5,000

// Different formatting methods
NumberFormatter.formatNumber(1234.56)                        // ₱1,234.56
NumberFormatter.formatNumberOnly(1234.56)                    // 1,234.56
NumberFormatter.formatCurrencyDecimals(1234.567, 3)         // ₱1,234.567
NumberFormatter.formatAbbreviated(1500000)                   // ₱1.5M
NumberFormatter.formatPercentage(85.5)                     // 85.50%
NumberFormatter.formatCount(1500)                            // 1,500
```

## 📅 DateFormatter

Handles all date formatting consistently across admin pages.

### Usage Examples:

```javascript
import { DateFormatter } from './Function_Files/DateFormatter'

// Basic date formatting
<span>{DateFormatter.formatDateOnly(booking.checkin_date)}</span>           // January 15, 2024
<span>{DateFormatter.formatTimeOnly(booking.time)}</span>                  // 14:30
<span>{DateFormatter.formatDate(booking.created_at)}</span>                // Jan 15, 2024 at 2:30 PM

// Specialized formatting
<span>{DateFormatter.formatShortDate(booking.date)}</span>                  // 01/15/2024
<span>{DateFormatter.formatLongDate(booking.date)}</span>                   // January 15, 2024
<span>{DateFormatter.formatRelativeDate(booking.date)}</span>               // "Today", "2 days ago", etc.
<span>{DateFormatter.formatCompactDate(booking.date)}</span>               // 01/15/24

// Date range formatting
<span>{DateFormatter.formatDateRange(checkin, checkout)}</span>             // January 15, 2024 - January 17, 2024

// Date utilities
DateFormatter.isToday(booking.date)                         // true/false
DateFormatter.isPast(booking.date)                          // true/false
DateFormatter.isFuture(booking.date)                        // true/false
DateFormatter.getCurrentPhilippinesDate()                   // Current PH timezone date

// Responsive table formatting
const responsiveDates = DateFormatter.formatForTable(booking.date)
<span className="md:hidden">{responsiveDates.mobile}</span>                 // Compact on mobile
<span className="hidden md:block">{responsiveDates.desktop}</span>          // Full on desktop
<span>{responsiveDates.full}</span>                                         // Always full format

// Array formatting
const formattedDates = DateFormatter.formatArray(dates, 'date')            // ['Jan 15', 'Jan 16', ...]
```

## 🎯 Integration Examples

### In React Components:

```javascript
import React from 'react'
import { NumberFormatter, DateFormatter } from '../Function_Files'

function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <h3>Booking #{booking.id}</h3>
      
      {/* Consistent date formatting */}
      <p>
        <strong>Check-in:</strong> {DateFormatter.formatDateOnly(booking.checkin_date)}
      </p>
      <p>
        <strong>Check-out:</strong> {DateFormatter.formatDateOnly(booking.checkout_date)}
      </p>
      
      {/* Relative date indicators */}
      <p className={`text-sm ${
        DateFormatter.isPast(booking.checkin_date) ? 'text-red-500' : 'text-green-500'
      }`}>
        {DateFormatter.formatRelativeDate(booking.checkin_date)}
      </p>
      
      {/* Consistent currency formatting */}
      <p>
        <strong>Total Amount:</strong> {NumberFormatter.formatCurrency(booking.total_amount)}
      </p>
      <p>
        <strong>Downpayment:</strong> {NumberFormatter.formatCurrency(booking.downpayment)}
      </p>
      
      {/* Responsive counts */}
      <p>
        <strong>Guests:</strong> {NumberFormatter.formatCount(booking.guest_count)}
      </p>
    </div>
  )
}
```

### In Table Components:

```javascript
import { NumberFormatter, DateFormatter } from '../Function_Files'

const columns = [
  {
    header: 'Customer',
    accessor: (row) => row.customer_name
  },
  {
    header: 'Check-in',
    accessor: (row) => {
      const dates = DateFormatter.formatForTable(row.checkin_date)
      return (
        <>
          <span className="md:hidden">{dates.mobile}</span>
          <span className="hidden md:block">{dates.desktop}</span>
        </>
      )
    }
  },
  {
    header: 'Amount',
    accessor: (row) => NumberFormatter.formatCurrency(row.total_amount)
  },
  {
    header: 'Status',
    accessor: (row) => {
      const isOverdue = DateFormatter.isPast(row.checkout_date)
      return (
        <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-success'}`}>
          {isOverdue ? 'Overdue' : 'Active'}
        </span>
      )
    }
  }
]
```

### In Forms:

```javascript
import { NumberFormatter, DateFormatter } from '../Function_Files'

function PaymentForm({ onSubmit }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  
  const handleAmountChange = (e) => {
    const inputValue = NumberFormatter.parseCurrencyInput(e.target.value)
    setAmount(inputValue)
  }
  
  const handleDateChange = (e) => {
    const inputDate = DateFormatter.parseDateInput(e.target.value)
    setDate(inputDate)
  }
  
  return (
    <form onSubmit={onSubmit}>
      <input 
        type="text"
        placeholder="Enter amount..."
        onChange={handleAmountChange}
      />
      
      <input 
        type="date"
        value={date ? DateFormatter.formatCompactDate(date) : ''}
        onChange={handleDateChange}
      />
      
      {/* Preview formatted values */}
      <div className="preview">
        <p>Amount: {NumberFormatter.formatCurrency(amount)}</p>
        <p>Date: {DateFormatter.formatDateOnly(date)}</p>
      </div>
    </form>
  )
}
```

## 🚀 Benefits

1. **Consistency**: All dates and numbers formatted uniformly across admin pages
2. **Maintainability**: Change format rules in one place
3. **Internationalization**: Easy to switch locales and timezones
4. **Responsive**: Built-in responsive formatting for mobile/desktop
5. **Error Handling**: Graceful handling of invalid dates/numbers
6. **Performance**: Optimized formatting methods
7. **Typing**: Full TypeScript support (when implemented)

## 📁 File Structure

```
Function_Files/
├── NumberFormatter.js      # Number and currency formatting
├── DateFormatter.js        # Date and time formatting
└── README.md              # This documentation
```

## 🎨 Customization

Both formatters accept configuration options:

```javascript
// Custom number formatting
NumberFormatter.formatCurrency(1000, {
  locale: 'en-PH',
  symbol: '₱',
  minimumFractionDigits: 0
})

// Custom date formatting
DateFormatter.formatDate(date, {
  locale: 'en-PH',
  timeZone: 'Asia/Manila',
  dateOnly: true
})
```

Use these utilities throughout your admin pages for consistent, professional formatting! 🎉
