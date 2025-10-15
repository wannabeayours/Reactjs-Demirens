import React, { useState } from 'react'
import AdminHeader from './components/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from "lucide-react"

function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  // Sample room groups and bookings for timeline view
  const roomGroups = [
    {
      name: "Economy Rooms",
      rooms: [
        { id: 101, name: "Room 101 / Floor 1" },
        { id: 102, name: "Room 102 / Floor 1" },
        { id: 103, name: "Room 103 / Floor 1" },
      ],
    },
    {
      name: "Standard Rooms",
      rooms: [
        { id: 201, name: "Room 201 / Floor 2" },
        { id: 202, name: "Room 202 / Floor 2" },
        { id: 203, name: "Room 203 / Floor 2" },
      ],
    },
    {
      name: "VIP Rooms",
      rooms: [
        { id: 301, name: "Room 301 / Floor 3" },
        { id: 302, name: "Room 302 / Floor 3" },
      ],
    },
  ]

  const sampleBookings = [
    { id: "b1", roomId: 101, guest: "Lisa Davidson", start: new Date(currentYear, currentMonth, 2), end: new Date(currentYear, currentMonth, 5), color: "bg-green-200 text-green-800" },
    { id: "b2", roomId: 201, guest: "Alex Hamilton", start: new Date(currentYear, currentMonth, 4), end: new Date(currentYear, currentMonth, 8), color: "bg-blue-200 text-blue-800" },
    { id: "b3", roomId: 202, guest: "JJ Jackson", start: new Date(currentYear, currentMonth, 7), end: new Date(currentYear, currentMonth, 9), color: "bg-pink-200 text-pink-800" },
    { id: "b4", roomId: 301, guest: "Olga K", start: new Date(currentYear, currentMonth, 10), end: new Date(currentYear, currentMonth, 14), color: "bg-purple-200 text-purple-800" },
    { id: "b5", roomId: 103, guest: "Myrna Sales", start: new Date(currentYear, currentMonth, 13), end: new Date(currentYear, currentMonth, 16), color: "bg-yellow-200 text-yellow-800" },
    { id: "b6", roomId: 302, guest: "Vito Bravo", start: new Date(currentYear, currentMonth, 18), end: new Date(currentYear, currentMonth, 21), color: "bg-indigo-200 text-indigo-800" },
  ]

  const getDayIndex = (dateObj) => Math.max(0, Math.min(daysInMonth - 1, dateObj.getDate() - 1))

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

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

  // Get events for a specific date (not used in timeline view)
  const getEventsForDate = () => []

  // Check if date is today
  const isToday = (date) => {
    const today = new Date()
    return (
      date === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  // Check if date is selected (not used in timeline view)
  const isSelected = () => false

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
          onClick={() => {}}
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

  // Get selected date events (not used in timeline view)
  const selectedDateEvents = []

  return (
    <div className="ml-0 lg:ml-72 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 max-w-full overflow-x-hidden">
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
        <CardContent className="overflow-x-auto">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg sm:text-xl font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          </div>

          {/* Days header like timeline */}
          <div className="min-w-[800px]">
            <div className="grid" style={{gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(38px, 1fr))`}}>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Rooms</div>
              {daysArray.map((d) => (
                <div key={`dh-${d}`} className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs border border-gray-200 dark:border-gray-700">
                  {d}
                </div>
              ))}
            </div>

            {/* Room Groups */}
            {roomGroups.map((group) => (
              <div key={group.name} className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{group.name}</span>
                </div>
                {group.rooms.map((room) => {
                  const roomBookings = sampleBookings.filter(b => b.roomId === room.id)
                  return (
                    <div key={room.id} className="grid items-center" style={{gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(38px, 1fr))`}}>
                      {/* Room label */}
                      <div className="p-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{room.name}</div>
                      {/* Day cells with bookings overlayed */}
                      {daysArray.map((d) => (
                        <div key={`dc-${room.id}-${d}`} className="relative h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"></div>
                      ))}
                      {/* Booking blocks absolute positioned across the row */}
                      <div className="contents">
                        {roomBookings.map((bk) => {
                          const startIdx = getDayIndex(bk.start)
                          const endIdx = getDayIndex(bk.end)
                          const span = Math.max(1, endIdx - startIdx + 1)
                          return (
                            <div
                              key={bk.id}
                              className={`col-start-[${startIdx+2}] col-span-${span} relative flex items-center`}
                              style={{gridColumnStart: startIdx + 2, gridColumnEnd: startIdx + 2 + span}}
                            >
                              <div className={`absolute left-0 right-0 m-1 h-8 rounded-md px-3 flex items-center gap-2 shadow-sm ${bk.color}`}>
                                <div className="w-6 h-6 rounded-full bg-white/70 border border-white/80"></div>
                                <span className="text-xs font-medium truncate">{bk.guest}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminCalendar