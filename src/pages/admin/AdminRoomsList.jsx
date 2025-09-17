import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Search, Grid, List } from 'lucide-react'

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

import AdminHeader from './components/AdminHeader'

function AdminRoomsList() {
  const APIConn = `${localStorage.url}admin.php`

  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  // Status filtering removed; use dates instead
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterCheckIn, setFilterCheckIn] = useState('')
  const [filterCheckOut, setFilterCheckOut] = useState('')

  const getRooms = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("method", "viewRooms")

    try {
      const conn = await axios.post(APIConn, formData)
      if (conn.data) {
        console.log('API response:', conn.data)
        setRooms(conn.data !== 0 ? conn.data : [])
      } else {
        console.log("No data has been fetched...")
      }
    } catch (err) {
      console.log('Cannot Find API...', err)
    } finally {
      console.log('Content is Done...')
      setIsLoading(false)
    }
  }

  

  useEffect(() => {
    getRooms()
  }, [])

  // removed status fetching

  const parseDate = (str) => (str ? new Date(str + 'T00:00:00') : null)
  const rangesOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB
  const addDays = (date, days) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }
  const fmt = (date) => (date ? date.toISOString().slice(0, 10) : '')
  const tomorrow = fmt(addDays(new Date(), 1))
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

  // Date handlers with validation
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rooms.filter((room) => {
      const matchesSearch =
        room.roomtype_name?.toLowerCase().includes(q) ||
        room.roomtype_description?.toLowerCase().includes(q) ||
        String(room.roomnumber_id).includes(q)
      const matchesDateRange = isAvailableOnFilterRange(room)
      return matchesSearch && matchesDateRange
    })
  }, [rooms, search, filterCheckIn, filterCheckOut])

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

  return (
    <>
      <AdminHeader />
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
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
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

                {/* Status Filter removed */}

                {/* Optional Date Range Filter */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filterCheckIn}
                    onChange={(e) => handleFilterInChange(e.target.value)}
                    min={tomorrow}
                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={filterCheckOut}
                    onChange={(e) => handleFilterOutChange(e.target.value)}
                    min={filterCheckIn ? fmt(addDays(parseDate(filterCheckIn), 1)) : tomorrow}
                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* View Mode Toggle and Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
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
              {filtered.map((room, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {room.roomtype_name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          Room #{room.roomnumber_id} • Floor {room.roomfloor}
                        </CardDescription>
                      </div>
                      {/* Status badge removed */}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="relative">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {!room.images ? (
                            <CarouselItem>
                              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                                    <Search className="h-8 w-8 mx-auto" />
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">No Images</p>
                                </div>
                              </div>
                            </CarouselItem>
                          ) : (
                            room.images.split(",").map((imageName, idx) => (
                              <CarouselItem key={idx}>
                                <div className="aspect-video overflow-hidden rounded-lg">
                                  <img
                                    src={`${localStorage.url}images/${imageName}`}
                                    alt={`${room.roomtype_name} ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              </CarouselItem>
                            ))
                          )}
                        </CarouselContent>
                        <CarouselPrevious className="left-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800" />
                        <CarouselNext className="right-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800" />
                      </Carousel>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₱{Number(room.roomtype_price).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          per night
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Capacity: {room.roomtype_capacity}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {room.roomtype_beds} bed{room.roomtype_beds > 1 ? 's' : ''}
                      </div>
                      {filterCheckIn && filterCheckOut && (
                        <div className="mt-2">
                          {isAvailableOnFilterRange(room) ? (
                            <span className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700">Available on dates</span>
                          ) : (
                            <span className="inline-block text-xs px-2 py-1 rounded bg-red-100 text-red-700">Conflict on dates</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminRoomsList
