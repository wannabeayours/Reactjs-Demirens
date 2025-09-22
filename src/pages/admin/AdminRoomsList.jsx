import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Search, Grid, List, SlidersHorizontal, Eye, Edit, EyeOff } from 'lucide-react'

// Card Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Carousel Components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Button } from "@/components/ui/button"

import AdminHeader from './components/AdminHeader'
import AdvancedFiltersSheet from './SubPages/AdvancedFiltersSheet'

const getRoomStatusForDates = (room, startDate, endDate) => {
  if (room.bookings && room.bookings.length > 0) {
    for (const booking of room.bookings) {
      const checkIn = new Date(booking.checkin_date + "T00:00:00");
      const checkOut = new Date(booking.checkout_date + "T00:00:00");

      // Overlap check: if booking intersects with selected range
      if (startDate < checkOut && endDate > checkIn) {
        return "Occupied";
      }
    }
  }

  // Default fallback: use API-provided status OR Vacant
  return room.status_name || "Vacant";
};


function AdminRoomsList() {
  const APIConn = `${localStorage.url}admin.php`

  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterCheckIn, setFilterCheckIn] = useState('')
  const [filterCheckOut, setFilterCheckOut] = useState('')
  const [monitoringMode, setMonitoringMode] = useState(true) // toggle state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    roomStatus: '',
    roomType: '',
    priceRange: [0, 5000],
    selectedFloors: []
  })

  const getRooms = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("method", "viewRooms")

    try {
      const conn = await axios.post(APIConn, formData)
      if (conn.data) {
        setRooms(conn.data !== 0 ? conn.data : [])
      } else {
        console.log("No data has been fetched...")
      }
    } catch (err) {
      console.log('Cannot Find API...', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
  }, [])

  // Helpers
  const parseDate = (str) => (str ? new Date(str + 'T00:00:00') : null)
  const rangesOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB
  const addDays = (date, days) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }
  const fmt = (date) => (date ? date.toISOString().slice(0, 10) : '')

  const getPhilippinesDate = () => {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
    )
  }

  // Mode: Real-time monitoring (PH date)
  const getCurrentRoomStatus = (room) => {
    const now = getPhilippinesDate()
    const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00")

    if (room.bookings && room.bookings.length > 0) {
      for (const booking of room.bookings) {
        const checkIn = new Date(booking.checkin_date + "T00:00:00")
        const checkOut = new Date(booking.checkout_date + "T00:00:00")

        if (today >= checkIn && today < checkOut) {
          return "Occupied"
        }
      }
    }

    return room.status_name || "Vacant"
  }

  // Mode: Filtered by chosen dates
  const isAvailableOnFilterRange = (room) => {
    const start = parseDate(filterCheckIn)
    const end = parseDate(filterCheckOut)
    if (!start || !end) return true
    const bookings = Array.isArray(room.bookings) ? room.bookings : []
    for (const b of bookings) {
      const bStart = parseDate(b.checkin_date)
      const bEnd = parseDate(b.checkout_date)
      if (!bStart || !bEnd) continue
      if (rangesOverlap(start, end, bStart, bEnd)) return false
    }
    return true
  }

  // Date handlers
  const handleFilterInChange = (value) => {
    const inDate = parseDate(value)
    const outDate = parseDate(filterCheckOut)
    if (inDate && outDate && inDate >= outDate) {
      const next = addDays(inDate, 1)
      setFilterCheckIn(value)
      setFilterCheckOut(fmt(next))
    } else {
      setFilterCheckIn(value)
    }
  }

  const handleFilterOutChange = (value) => {
    const inDate = parseDate(filterCheckIn)
    const outDate = parseDate(value)
    if (inDate && outDate && outDate <= inDate) {
      const next = addDays(inDate, 1)
      setFilterCheckOut(fmt(next))
    } else {
      setFilterCheckOut(value)
    }
  }

  // Filtering logic
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rooms.filter((room) => {
      // Basic search filter
      const matchesSearch =
        room.roomtype_name?.toLowerCase().includes(q) ||
        room.roomtype_description?.toLowerCase().includes(q) ||
        String(room.roomnumber_id).includes(q)

      // Date range filter
      let matchesDateRange = true
      if (!monitoringMode) {
        matchesDateRange = isAvailableOnFilterRange(room)
      }

      // Advanced filters
      let matchesAdvancedFilters = true

      // Room status filter
      if (advancedFilters.roomStatus && advancedFilters.roomStatus !== 'all') {
        const currentStatus = monitoringMode
          ? getCurrentRoomStatus(room).toLowerCase()
          : (isAvailableOnFilterRange(room) ? room.status_name?.toLowerCase() : "occupied")

        matchesAdvancedFilters = matchesAdvancedFilters && (currentStatus === advancedFilters.roomStatus)
      }

      // Room type filter
      if (advancedFilters.roomType && advancedFilters.roomType !== 'all') {
        matchesAdvancedFilters = matchesAdvancedFilters &&
          room.roomtype_name?.toLowerCase().includes(advancedFilters.roomType)
      }

      // Price range filter
      const price = Number(room.roomtype_price) || 0
      matchesAdvancedFilters = matchesAdvancedFilters &&
        (price >= advancedFilters.priceRange[0] && price <= advancedFilters.priceRange[1])

      // Floor filter
      if (advancedFilters.selectedFloors.length > 0) {
        matchesAdvancedFilters = matchesAdvancedFilters &&
          advancedFilters.selectedFloors.includes(Number(room.roomfloor))
      }

      return matchesSearch && matchesDateRange && matchesAdvancedFilters
    })
  }, [rooms, search, filterCheckIn, filterCheckOut, monitoringMode, advancedFilters])

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase()
    switch (statusLower) {
      case 'vacant':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under-maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'dirty':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Handle advanced filters
  const handleApplyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters);
  };

  return (
    <>
      <AdminHeader />
      <AdvancedFiltersSheet
        open={showAdvancedFilters}
        onOpenChange={setShowAdvancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Room Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor all hotel rooms
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search rooms, descriptions, or room numbers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             placeholder-gray-500 dark:placeholder-gray-400
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Advanced Filters Button */}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-800 dark:text-blue-400"
                  onClick={() => setShowAdvancedFilters(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
                </Button>

                {/* Date Filter (only shown if not in monitoring mode) */}
                {!monitoringMode && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filterCheckIn}
                      onChange={(e) => handleFilterInChange(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={filterCheckOut}
                      onChange={(e) => handleFilterOutChange(e.target.value)}
                      min={filterCheckIn ? fmt(addDays(parseDate(filterCheckIn), 1)) : ''}
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Toggle + View Mode */}
              <div className="flex items-center gap-4">
                {/* Monitoring Toggle */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Monitoring Mode
                  </label>
                  <input
                    type="checkbox"
                    checked={monitoringMode}
                    onChange={() => setMonitoringMode(!monitoringMode)}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{filtered.length}</span> of{' '}
                  <span className="font-medium">{rooms.length}</span> rooms
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading rooms...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No rooms found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            /* Rooms Grid/List */
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filtered.map((room, index) => {
                const status = monitoringMode
                  ? getCurrentRoomStatus(room)
                  : (isAvailableOnFilterRange(room) ? room.status_name : "Occupied")

                return (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="relative">
                      {/* Status Badge - Positioned on top of the image */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>

                      <CardContent className="p-0">
                        <div className="relative">
                          <Carousel className="w-full">
                            <CarouselContent>
                              {!room.images ? (
                                <CarouselItem>
                                  <div className="w-full h-56 flex items-center justify-center bg-muted">
                                    <span className="text-muted-foreground">No Image</span>
                                  </div>
                                </CarouselItem>
                              ) : (
                                room.images.split(",").map((imageName, idx) => (
                                  <CarouselItem key={idx}>
                                    <div className="overflow-hidden">
                                      <img
                                        src={`${localStorage.url}images/${imageName}`}
                                        alt={`${room.roomtype_name} ${idx + 1}`}
                                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
                                      />
                                    </div>
                                  </CarouselItem>
                                ))
                              )}
                            </CarouselContent>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                          </Carousel>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                          {room.roomtype_name} — Room #{room.roomnumber_id} (Floor {room.roomfloor})
                        </h2>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₱{Number(room.roomtype_price).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {room.roomtype_description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Capacity: {room.roomtype_capacity} {room.roomtype_capacity > 1 ? 'persons' : 'person'} •
                        {room.roomtype_beds} bed{room.roomtype_beds > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {/* Action Buttons */ }
                <CardFooter className="px-4 pt-3 pb-4 border-t border-border mt-3">
                  <div className="flex items-center w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-1 bg-primary/5 hover:bg-primary/10 border-border text-primary"
                      onClick={() => console.log(`View Room ${room.roomnumber_id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 border-border text-amber-600 dark:text-amber-500"
                      onClick={() => console.log(`Edit Room ${room.roomnumber_id}`)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 border-border text-secondary-foreground"
                      onClick={() => console.log(`Hide Room ${room.roomnumber_id}`)}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </Button>
                  </div>
                </CardFooter>
                  </Card>
          )
          })}
        </div>
          )}
      </div>
    </div >
    </>
  )
}

export default AdminRoomsList
