import React, { useState } from 'react'
import AdminHeader from './components/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from "lucide-react"

function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Sample events data
  const sampleEvents = [
    { id: 1, date: 5, title: "Room 101 Check-in", type: "checkin", color: "bg-blue-500" },
    { id: 2, date: 8, title: "Room 205 Check-out", type: "checkout", color: "bg-green-500" },
    { id: 3, date: 12, title: "Maintenance", type: "maintenance", color: "bg-yellow-500" },
    { id: 4, date: 15, title: "Room 301 Check-in", type: "checkin", color: "bg-blue-500" },
    { id: 5, date: 20, title: "Group Booking", type: "booking", color: "bg-purple-500" },
    { id: 6, date: 25, title: "Room 102 Check-out", type: "checkout", color: "bg-green-500" },
  ]

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return sampleEvents.filter(event => event.date === date)
  }

  // Check if date is today
  const isToday = (date) => {
    const today = new Date()
    return (
      date === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate === date
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-20 sm:h-24 border border-gray-200 dark:border-gray-700 min-w-0"></div>
      )
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDate(day)
      const isCurrentDay = isToday(day)
      const isSelectedDay = isSelected(day)

      days.push(
        <div
          key={day}
          className={`h-20 sm:h-24 border border-gray-200 dark:border-gray-700 p-1 sm:p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0 ${
            isCurrentDay ? 'bg-blue-100 dark:bg-blue-900' : ''
          } ${isSelectedDay ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
          onClick={() => setSelectedDate(selectedDate === day ? null : day)}
        >
          <div className={`text-xs sm:text-sm font-medium ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-0.5 sm:space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded text-white truncate ${event.color}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{events.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="ml-72 p-4 sm:p-6 space-y-6 max-w-full overflow-x-hidden">
      <AdminHeader />
      
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                <Calendar className="h-6 w-6 text-[#34699a] dark:text-[#34699a]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Hotel Calendar</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Manage bookings, check-ins, and events
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-[#34699a] hover:bg-[#2a5580] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-hidden">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="w-full overflow-hidden">
            <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg min-w-0">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 text-center font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {generateCalendarDays()}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Events for {monthNames[currentMonth]} {selectedDate}, {currentYear}
              </h3>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{event.type}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No events scheduled for this date.</p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Check-out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Booking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminCalendar