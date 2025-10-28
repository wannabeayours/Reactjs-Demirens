import React, { useState, useEffect } from 'react'
import AdminHeader from './components/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from "lucide-react"
import axios from 'axios'

function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const APIConn = `${localStorage.url}admin.php`
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters and pagination
  const [selectedRoomType, setSelectedRoomType] = useState("")
  const [selectedFloor, setSelectedFloor] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [visibleLimit, setVisibleLimit] = useState(8)

  useEffect(() => {
    setVisibleLimit(8)
  }, [selectedRoomType, selectedFloor, dateFrom, dateTo])

  // Month/year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // First/last day info
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Unique filter options
  const roomTypeOptions = React.useMemo(
    () => Array.from(new Set((rooms || []).map(r => r.roomtype_name))).filter(Boolean),
    [rooms]
  )
  const floorOptions = React.useMemo(
    () => Array.from(new Set((rooms || []).map(r => String(r.roomfloor)))).filter(Boolean),
    [rooms]
  )

  // Date range filter helpers
  const filterStart = React.useMemo(() => (dateFrom ? new Date(`${dateFrom}T00:00:00`) : null), [dateFrom])
  const filterEnd = React.useMemo(() => (dateTo ? new Date(`${dateTo}T23:59:59`) : null), [dateTo])
  const hasDateFilter = !!(filterStart && filterEnd && filterStart <= filterEnd)

  const nights = React.useMemo(() => {
    if (!hasDateFilter) return 0
    const ms = filterEnd - filterStart
    return ms > 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0
  }, [filterStart, filterEnd, hasDateFilter])

  const overlapsRange = (start, end, rangeStart, rangeEnd) => end >= rangeStart && start <= rangeEnd

  const monthStart = new Date(currentYear, currentMonth, 1, 0, 0, 0)
  const monthEnd = new Date(currentYear, currentMonth, daysInMonth, 23, 59, 59)

  // Rooms filtering and visibility
  const filteredRooms = React.useMemo(() => {
    const base = Array.isArray(rooms) ? rooms : []
    return base.filter(r => {
      const typeOk = !selectedRoomType || r.roomtype_name === selectedRoomType
      const floorOk = !selectedFloor || String(r.roomfloor) === String(selectedFloor)
      return typeOk && floorOk
    })
  }, [rooms, selectedRoomType, selectedFloor])

  const visibleRooms = React.useMemo(() => {
    return filteredRooms.slice(0, visibleLimit)
  }, [filteredRooms, visibleLimit])

  // Group VISIBLE rooms by type
  const roomGroups = React.useMemo(() => {
    const groups = {}
    visibleRooms.forEach(r => {
      const g = r.roomtype_name || 'Rooms'
      if (!groups[g]) groups[g] = []
      groups[g].push({ id: r.roomnumber_id, name: `Room ${r.roomnumber_id} / Floor ${r.roomfloor}` })
    })
    return Object.entries(groups).map(([name, rooms]) => ({ name, rooms }))
  }, [visibleRooms])

  // Booking status color
  const statusColor = (name) => {
    const key = (name || '').toLowerCase()
    if (key.includes('checked')) return 'bg-green-200 text-green-800'
    if (key.includes('reserve')) return 'bg-blue-200 text-blue-800'
    if (key.includes('pending')) return 'bg-amber-200 text-amber-800'
    if (key.includes('cancel')) return 'bg-red-200 text-red-800'
    return 'bg-slate-200 text-slate-800'
  }

  // Active bookings mapping
  const activeBookings = React.useMemo(() => {
    return (bookings || []).map(b => ({
      id: `bk-${b.booking_id}-${b.booking_room_id}`,
      roomId: b.roomnumber_id,
      guest: b.customer_name || b.reference_no || 'Guest',
      start: new Date(b.booking_checkin_dateandtime),
      end: new Date(b.booking_checkout_dateandtime),
      color: statusColor(b.booking_status_name)
    }))
  }, [bookings])

  // Fetch rooms and bookings
  useEffect(() => {
    let mounted = true
    async function fetchData () {
      try {
        const fdRooms = new FormData()
        fdRooms.append('method', 'viewAllRooms')
        const fdBookings = new FormData()
        fdBookings.append('method', 'get_booking_rooms_active')
        const [roomsRes, bookingsRes] = await Promise.all([
          axios.post(APIConn, fdRooms),
          axios.post(APIConn, fdBookings)
        ])
        if (!mounted) return
        const roomsData = Array.isArray(roomsRes.data) ? roomsRes.data : []
        const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
        setRooms(roomsData)
        setBookings(bookingsData)
      } catch (e) {
        console.error('Calendar fetch error:', e)
        setRooms([])
        setBookings([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [APIConn])

  const getDayIndex = (dateObj) => Math.max(0, Math.min(daysInMonth - 1, dateObj.getDate() - 1))

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Events for a specific date (not used in timeline)
  const getEventsForDate = (day) => {
    const startOfDay = new Date(currentYear, currentMonth, day, 0, 0, 0)
    const endOfDay = new Date(currentYear, currentMonth, day, 23, 59, 59)
    return activeBookings
      .filter(bk => bk.start <= endOfDay && bk.end >= startOfDay)
      .map(bk => ({ id: bk.id, title: `${bk.guest} • Room ${bk.roomId}`, color: bk.color }))
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  const isSelected = (day) => selectedDay === day

  // Selected date events (not used in timeline)
  const selectedDateEvents = selectedDay ? getEventsForDate(selectedDay) : []

  // Helper: day within selected filter range
  const isDayInsideFilter = (dayNumber) => {
    if (!hasDateFilter) return false
    const dayDate = new Date(currentYear, currentMonth, dayNumber, 12, 0, 0)
    const startTrunc = new Date(filterStart.getFullYear(), filterStart.getMonth(), filterStart.getDate(), 12, 0, 0)
    const endTrunc = new Date(filterEnd.getFullYear(), filterEnd.getMonth(), filterEnd.getDate(), 12, 0, 0)
    return dayDate >= startTrunc && dayDate <= endTrunc
  }

  return (
    <div className="ml-0 lg:ml-72 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 max-w-full overflow-x-hidden">
      <AdminHeader />
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
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">Room Type</label>
              <select value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 dark:border-gray-700">
                <option value="">All Types</option>
                {roomTypeOptions.map(rt => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">Floor</label>
              <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 dark:border-gray-700">
                <option value="">All Floors</option>
                {floorOptions.map(fl => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 dark:border-gray-700" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 dark:border-gray-700" />
            </div>
            <div className="flex items-end">
              {hasDateFilter ? (
                <div className="text-xs sm:text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded w-full text-center">{nights} Night{nights === 1 ? '' : 's'}</div>
              ) : (
                <div className="text-xs sm:text-sm px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded w-full text-center">Select dates</div>
              )}
            </div>
          </div>

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
              {daysArray.map((d) => {
                const inFilter = isDayInsideFilter(d)
                const isCurrentDay = isToday(d)
                return (
                  <div
                    key={`dh-${d}`}
                    className={`p-2 text-center text-xs border border-gray-200 dark:border-gray-700 ${inFilter ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'} ${isCurrentDay ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    {d}
                  </div>
                )
              })}
            </div>

            {/* Room Groups (using filtered visible rooms) */}
            {roomGroups.map((group) => (
              <div key={group.name} className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{group.name}</span>
                </div>
                {group.rooms.map((room) => {
                  // Bookings for this room, overlap with month and (optionally) filter range
                  const roomBookings = activeBookings.filter(b => {
                    if (b.roomId !== room.id) return false
                    const overlapsMonth = overlapsRange(b.start, b.end, monthStart, monthEnd)
                    if (!overlapsMonth) return false
                    if (hasDateFilter) {
                      return overlapsRange(b.start, b.end, filterStart, filterEnd)
                    }
                    return true
                  })

                  return (
                    <div key={room.id} className="grid items-center" style={{gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(38px, 1fr))`}}>
                      {/* Room label */}
                      <div className="p-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{room.name}</div>
                      {/* Day cells */}
                      {daysArray.map((d) => (
                        <div key={`dc-${room.id}-${d}`} className="relative h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"></div>
                      ))}
                      {/* Booking blocks clipped to month and selected filter range */}
                      <div className="contents">
                        {roomBookings.map((bk) => {
                          // Clip booking to current month range
                          let clipStart = new Date(Math.max(bk.start.getTime(), monthStart.getTime()))
                          let clipEnd = new Date(Math.min(bk.end.getTime(), monthEnd.getTime()))
                          // Further clip to filter range if applied
                          if (hasDateFilter) {
                            clipStart = new Date(Math.max(clipStart.getTime(), filterStart.getTime()))
                            clipEnd = new Date(Math.min(clipEnd.getTime(), filterEnd.getTime()))
                          }
                          // If after clipping the range is invalid, skip
                          if (clipEnd < clipStart) return null
                          const startIdx = getDayIndex(clipStart)
                          const endIdx = getDayIndex(clipEnd)
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

            {/* Load more rooms */}
            {filteredRooms.length > visibleRooms.length && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setVisibleLimit((l) => l + 8)}>
                  Load 8 more rooms
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminCalendar