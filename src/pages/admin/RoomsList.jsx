import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Search, Grid, List, SlidersHorizontal, Edit, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import AdminHeader from './components/AdminHeader'
import AdvancedFiltersSheet from './SubPages/AdvancedFiltersSheet'
import AdminModal from './components/AdminModal'

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
  
  // Room type selection state
  const [selectedRoomType, setSelectedRoomType] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  
  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentRoomImages, setCurrentRoomImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoomTypeForEdit, setSelectedRoomTypeForEdit] = useState(null)
  const [editForm, setEditForm] = useState({ price: '', description: '' })
  const [savingEdit, setSavingEdit] = useState(false)

  // Map of roomtype_id -> images string from master endpoint
  const [roomTypeImagesMap, setRoomTypeImagesMap] = useState({})
  
  // Track current image index for each room type
  const [currentImageIndices, setCurrentImageIndices] = useState({})
  
  // Room numbers modal state
  const [showRoomNumbersModal, setShowRoomNumbersModal] = useState(false)
  const [selectedRoomTypeForModal, setSelectedRoomTypeForModal] = useState(null)
  const [updatingRoomStatus, setUpdatingRoomStatus] = useState(null)

  const getRooms = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("method", "viewRooms")

    try {
      const conn = await axios.post(APIConn, formData)
      if (conn.data) {
        setRooms(conn.data !== 0 ? conn.data : [])
      }

      // Fetch room type master images for more reliable carousel sources
      try {
        const fd = new FormData()
        fd.append('method', 'view_room_types')
        const rtRes = await axios.post(APIConn, fd)
        const list = Array.isArray(rtRes.data) ? rtRes.data : []
        const map = {}
        list.forEach(rt => {
          if (rt && rt.roomtype_id != null) {
            map[rt.roomtype_id] = rt.images || ''
          }
        })
        setRoomTypeImagesMap(map)
      } catch (err) {
        // ignore; fallback to images from viewRooms
      }
    } catch (err) {
      // silent fail; optionally show toast
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
  }, [])

  // Group rooms by type when rooms data changes
  useEffect(() => {
    if (rooms.length > 0) {
      const groupedRooms = rooms.reduce((acc, room) => {
        const typeName = room.roomtype_name
        if (!acc[typeName]) {
          acc[typeName] = {
            id: room.roomtype_id,
            name: typeName,
            description: room.roomtype_description,
            price: room.roomtype_price,
            capacity: room.roomtype_capacity,
            beds: room.roomtype_beds,
            rooms: [],
            // Prefer master images map if available, else fallback to room.images
            images: roomTypeImagesMap[room.roomtype_id] ?? room.images
          }
        }
        acc[typeName].rooms.push(room)
        return acc
      }, {})

      // Convert to array and ensure we have the 8 specific room types
      const roomTypesArray = Object.values(groupedRooms)
      setRoomTypes(roomTypesArray)
    }
  }, [rooms])

  // Normalize image payload from API to an array of filenames
  const toImagesArray = (images) => {
    if (!images) return []
    if (Array.isArray(images)) {
      // Accept [{imagesroommaster_filename: 'x.jpg'}, ...] or ['x.jpg', 'y.jpg']
      if (images.length > 0 && typeof images[0] === 'object' && images[0] !== null) {
        return images
          .map(it => it.imagesroommaster_filename || it.filename || it.image || '')
          .map(s => String(s).trim())
          .filter(Boolean)
      }
      return images.map(s => String(s).trim()).filter(Boolean)
    }
    const str = String(images).trim()
    if (!str) return []
    // Try JSON array string
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str)
        return toImagesArray(parsed)
      } catch {
        // fall through to comma split
      }
    }
    // Comma-separated string
    return str.split(',').map(s => s.trim()).filter(Boolean)
  }

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

    // First, check if the room is explicitly Under-Maintenance (4) or has other non-Vacant status
    if (room.room_status_id === 4) {
      return "Under-Maintenance";
    } else if (room.room_status_id === 5) {
      return "Dirty";
    } else if (room.room_status_id === 1) {
      return "Occupied";
    }

    // Then check bookings for occupancy
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

  // Filtering logic for room types
  const filteredRoomTypes = useMemo(() => {
    const q = search.toLowerCase()
    return roomTypes.filter((roomType) => {
      // Basic search filter
      const matchesSearch =
        roomType.name?.toLowerCase().includes(q) ||
        roomType.description?.toLowerCase().includes(q) ||
        String(roomType.id).includes(q)

      // Advanced filters
      let matchesAdvancedFilters = true

      // Room type filter
      if (advancedFilters.roomType && advancedFilters.roomType !== 'all') {
        matchesAdvancedFilters = matchesAdvancedFilters && roomType.name?.toLowerCase().includes(advancedFilters.roomType)
      }

      // Price range filter
      const price = Number(roomType.price) || 0
      matchesAdvancedFilters = matchesAdvancedFilters && (price >= advancedFilters.priceRange[0] && price <= advancedFilters.priceRange[1])

      // Room count filter (if needed)
      if (advancedFilters.selectedFloors.length > 0) {
        // For room types, we can filter by room count or other criteria
        matchesAdvancedFilters = matchesAdvancedFilters && roomType.rooms.length > 0
      }

      return matchesSearch && matchesAdvancedFilters
    })
  }, [roomTypes, search, advancedFilters])

  // Filtering logic for individual rooms (when viewing specific room type)
  const filteredRooms = useMemo(() => {
    if (!selectedRoomType) return []
    
    const q = search.toLowerCase()
    return selectedRoomType.rooms.filter((room) => {
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
        const currentStatus = monitoringMode ? getCurrentRoomStatus(room).toLowerCase() : (isAvailableOnFilterRange(room) ? room.status_name?.toLowerCase() : "occupied")

        matchesAdvancedFilters = matchesAdvancedFilters && (currentStatus === advancedFilters.roomStatus)
      }

      // Floor filter
      if (advancedFilters.selectedFloors.length > 0) {
        matchesAdvancedFilters = matchesAdvancedFilters && advancedFilters.selectedFloors.includes(Number(room.roomfloor))
      }

      return matchesSearch && matchesDateRange && matchesAdvancedFilters
    })
  }, [selectedRoomType, search, filterCheckIn, filterCheckOut, monitoringMode, advancedFilters])

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
      case 'disabled':
        return 'bg-gray-100 text-gray-500 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Handle advanced filters
  const handleApplyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters);
  };

  // Navigation functions for room type selection
  const handleViewRoomType = (roomType) => {
    setSelectedRoomTypeForModal(roomType);
    setShowRoomNumbersModal(true);
  };

  const handleBackToRoomTypes = () => {
    setSelectedRoomType(null);
  };

  // Edit Room Type details
  const handleEditRoomType = async (roomType) => {
    setSelectedRoomTypeForEdit(roomType)
    setEditForm({
      price: String(roomType.price || ''),
      description: roomType.description || ''
    })
    setShowEditModal(true)

    // Check the API for the room type and persist returned ID/name
    try {
      const fd = new FormData()
      fd.append('method', 'view_room_types')
      const res = await axios.post(APIConn, fd)
      const list = Array.isArray(res.data) ? res.data : []
      const baseRoom = roomType.rooms?.[0] || {}
      const candidateId = roomType.id ?? roomType.roomtype_id ?? baseRoom.roomtype_id
      const match = list.find(rt => rt.roomtype_id === candidateId) ||
                    list.find(rt => (rt.roomtype_name || '').toLowerCase() === (roomType.name || '').toLowerCase())
      if (match) {
        setSelectedRoomTypeForEdit(prev => ({
          ...(prev || roomType),
          id: match.roomtype_id,
          roomtype_id: match.roomtype_id,
          name: match.roomtype_name || (prev?.name ?? roomType.name)
        }))
      }
    } catch (err) {
      // silent
    }
  }

  const handleEditFieldChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedRoomTypeForEdit(null)
    setEditForm({ price: '', description: '' })
  }

  const handleSaveRoomTypeEdit = async () => {
    if (!selectedRoomTypeForEdit) return

    const parsedPrice = parseFloat(editForm.price)
    const desc = (editForm.description || '').trim()

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Please enter a valid non-negative price')
      return
    }
    if (desc.length < 3) {
      toast.error('Description is too short')
      return
    }

    const baseRoom = selectedRoomTypeForEdit.rooms?.[0] || {}
    let roomtypeId = selectedRoomTypeForEdit.id ?? selectedRoomTypeForEdit.roomtype_id ?? baseRoom.roomtype_id
    const roomtypeName = selectedRoomTypeForEdit.name || baseRoom.roomtype_name || ''

    // Fallback: derive roomtype_id from global rooms list by matching name
    if (!roomtypeId && roomtypeName) {
      const matchedRoom = rooms.find(r => r.roomtype_name === roomtypeName)
      roomtypeId = matchedRoom?.roomtype_id
    }

    if (!roomtypeId) {
      toast.error('Missing room type identifier')
      return
    }

    const jsonData = {
      roomtype_id: roomtypeId,
      roomtype_name: roomtypeName,
      roomtype_description: desc,
      roomtype_price: parsedPrice
    }

    try {
      setSavingEdit(true)
      const formData = new FormData()
      formData.append('method', 'update_room_types')
      formData.append('json', JSON.stringify(jsonData))

      const res = await axios.post(APIConn, formData)
      if (res.data) {
        toast.success('Updated Successfully')
        handleCloseEditModal()
        getRooms()
      } else {
        toast.error('Update failed: No response data')
      }
    } catch (err) {
      toast.error('Cannot update room type')
    } finally {
      setSavingEdit(false)
    }
  }
  
  // Toggle room status between Vacant (3) and Under-Maintenance (4)
  const toggleRoomStatus = async (roomId) => {
    setUpdatingRoomStatus(roomId);
    
    // Locate current room from either the grouped type view or full list
    const currentRoom = (selectedRoomType?.rooms || rooms).find(r => r.roomnumber_id === roomId)
    if (!currentRoom) {
      setUpdatingRoomStatus(null);
      return;
    }

    // Normalize current status to number and decide next status
    const currentId = Number(currentRoom.room_status_id)
    const nextStatusId = currentId === 4 ? 3 : 4
    const nextStatusName = nextStatusId === 3 ? 'Vacant' : 'Under-Maintenance'


    // Optimistic UI update: swap button label immediately
    setRooms(prev => prev.map(r => (
      r.roomnumber_id === roomId
        ? { ...r, room_status_id: nextStatusId, status_name: nextStatusName }
        : r
    )))
    setSelectedRoomType(prev => (
      prev ? {
        ...prev,
        rooms: prev.rooms.map(r => (
          r.roomnumber_id === roomId
            ? { ...r, room_status_id: nextStatusId, status_name: nextStatusName }
            : r
        ))
      } : prev
    ))

    try {
      const formData = new FormData()
      formData.append('method', 'toggleRoomStatus')
      formData.append('room_id', roomId)
      const res = await axios.post(APIConn, formData)


      if (res?.data?.success) {
        // Use backend-confirmed values, with robust fallbacks
        const confirmedIdRaw = res?.data?.new_status_id ?? res?.data?.status_id ?? nextStatusId
        const confirmedId = Number(confirmedIdRaw)
        const confirmedName = res?.data?.new_status_name ?? res?.data?.status_name ?? (confirmedId === 4 ? 'Under-Maintenance' : 'Vacant')

        setRooms(prev => prev.map(r => (
          r.roomnumber_id === roomId
            ? { ...r, room_status_id: confirmedId, status_name: confirmedName }
            : r
        )))
        setSelectedRoomType(prev => (
          prev ? {
            ...prev,
            rooms: prev.rooms.map(r => (
              r.roomnumber_id === roomId
                ? { ...r, room_status_id: confirmedId, status_name: confirmedName }
                : r
            ))
          } : prev
        ))
        // Also update modal data if it's open
        if (selectedRoomTypeForModal) {
          setSelectedRoomTypeForModal(prev => ({
            ...prev,
            rooms: prev.rooms.map(r => (
              r.roomnumber_id === roomId
                ? { ...r, room_status_id: confirmedId, status_name: confirmedName }
                : r
            ))
          }));
        }
        toast.success(`Room ${roomId} is now ${confirmedName}`)
      } else {
        // Revert optimistic update on failure
        setRooms(prev => prev.map(r => (
          r.roomnumber_id === roomId
            ? { ...r, room_status_id: currentRoom.room_status_id, status_name: currentRoom.status_name }
            : r
        )))
        setSelectedRoomType(prev => (
          prev ? {
            ...prev,
            rooms: prev.rooms.map(r => (
              r.roomnumber_id === roomId
                ? { ...r, room_status_id: currentRoom.room_status_id, status_name: currentRoom.status_name }
                : r
            ))
          } : prev
        ))
        // Also update modal data if it's open
        if (selectedRoomTypeForModal) {
          setSelectedRoomTypeForModal(prev => ({
            ...prev,
            rooms: prev.rooms.map(r => (
              r.roomnumber_id === roomId
                ? { ...r, room_status_id: currentRoom.room_status_id, status_name: currentRoom.status_name }
                : r
            ))
          }));
        }
        toast.error(res?.data?.message || 'Unable to toggle status')
      }
    } catch (error) {
      console.error('[RoomsList] toggleRoomStatus error', error)
      // Revert optimistic update on error
      setRooms(prev => prev.map(r => (
        r.roomnumber_id === roomId
          ? { ...r, room_status_id: currentRoom.room_status_id, status_name: currentRoom.status_name }
          : r
      )))
      setSelectedRoomType(prev => (
        prev ? {
          ...prev,
          rooms: prev.rooms.map(r => (
            r.roomnumber_id === roomId
              ? { ...r, room_status_id: currentRoom.room_status_id, status_name: currentRoom.status_name }
              : r
          ))
        } : prev
      ))
      // Also update modal data if it's open
      if (selectedRoomTypeForModal) {
        setSelectedRoomTypeForModal(prev => ({
          ...prev,
          rooms: prev.rooms.map(r => (
            r.roomnumber_id === roomId
              ? { ...r, room_status_id: currentRoom.room_status_id, status_name: currentRoom.status_name }
              : r
          ))
        }));
      }
      toast.error('Error toggling room status')
    } finally {
      setUpdatingRoomStatus(null);
    }
  };
  
  // Handle edit room
  const handleEditRoom = (roomId) => {
    // This would typically navigate to an edit page or open an edit modal
    // window.location.href = `/admin/edit-room/${roomId}`;
  };
  
  // Image modal functions
  const openImageModal = (room) => {
    const imgs = toImagesArray(room.images)
    if (imgs.length > 0) {
      setCurrentRoomImages(imgs)
      setCurrentImageIndex(0)
      setShowImageModal(true)
    }
  };
  
  const closeImageModal = () => {
    setShowImageModal(false);
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === currentRoomImages.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentRoomImages.length - 1 : prev - 1
    );
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {!selectedRoomType ? filteredRoomTypes.length : filteredRooms.length}
                  </span> of{' '}
                  <span className="font-medium">
                    {!selectedRoomType ? roomTypes.length : selectedRoomType.rooms.length}
                  </span> {!selectedRoomType ? 'room types' : 'rooms'}
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
          ) : !selectedRoomType ? (
            /* Room Types View */
            <>
              {filteredRoomTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No room types found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRoomTypes.map((roomType, index) => (
                    <Card 
                      key={index} 
                      className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                      onClick={() => handleViewRoomType(roomType)}
                    >
                      <div className="relative">
                        <CardContent className="p-0">
                          <div className="relative">
                            {(() => {
                              const imageArray = toImagesArray(roomType.images);
                              
                              return imageArray.length === 0 ? (
                                <div className="w-full h-56 flex items-center justify-center bg-muted">
                                  <span className="text-muted-foreground">No Image</span>
                                </div>
                              ) : imageArray.length === 1 ? (
                                <div className="w-full h-56 flex items-center justify-center bg-muted">
                                  <img
                                    src={`${localStorage.url}images/${imageArray[0]}`}
                                    alt={`${roomType.name}`}
                                    className="w-full h-56 object-cover"
                                    onClick={(e) => { e.stopPropagation(); openImageModal(roomType); }}
                                  />
                                </div>
                              ) : (
                                <div className="relative w-full">
                                  <div className="relative overflow-hidden">
                                    <div 
                                      className="flex transition-transform duration-300 ease-in-out"
                                      style={{ transform: `translateX(-${(currentImageIndices[roomType.name] || 0) * 100}%)` }}
                                    >
                                      {imageArray.map((imgName, idx) => (
                                        <div key={idx} className="w-full flex-shrink-0">
                                          <img
                                            src={`${localStorage.url}images/${imgName}`}
                                            alt={`${roomType.name} ${idx + 1}`}
                                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200 cursor-zoom-in"
                                            onClick={(e) => { e.stopPropagation(); openImageModal(roomType); }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 group opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentIndex = currentImageIndices[roomType.name] || 0;
                                      const newIndex = currentIndex === 0 ? imageArray.length - 1 : currentIndex - 1;
                                      setCurrentImageIndices(prev => ({ ...prev, [roomType.name]: newIndex }));
                                    }}
                                  >
                                    <svg 
                                      className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 group opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentIndex = currentImageIndices[roomType.name] || 0;
                                      const newIndex = currentIndex === imageArray.length - 1 ? 0 : currentIndex + 1;
                                      setCurrentImageIndices(prev => ({ ...prev, [roomType.name]: newIndex }));
                                    }}
                                  >
                                    <svg 
                                      className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-lg font-semibold text-foreground">
                            {roomType.name}
                          </h2>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {roomType.rooms.length} rooms
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {roomType.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ₱{Number(roomType.price).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {roomType.capacity} {roomType.capacity > 1 ? 'persons' : 'person'} • {roomType.beds} bed{roomType.beds > 1 ? 's' : ''}
                          </p>
                        </div>
                        <CardFooter className="px-0 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 border-border text-amber-600 dark:text-amber-500"
                            onClick={(e) => { e.stopPropagation(); handleEditRoomType(roomType); }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit Details
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Individual Rooms View */
            <>
              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={handleBackToRoomTypes}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Room Types
                </Button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                  {selectedRoomType.name} Rooms ({selectedRoomType.rooms.length} available)
                </h2>
              </div>

              {filteredRooms.length === 0 ? (
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
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {filteredRooms.map((room, index) => {
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
                          <div className="w-full h-56 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 tracking-wide">
                              Room {room.roomnumber_id}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                          {room.roomtype_name} — Room #{room.roomnumber_id} (Floor {room.roomfloor})
                        </h2>
                      </div>
                      {/* description removed */}
                      {/* capacity removed for individual room cards */}
                    </div>
                    
                    {/* Action Buttons */}
                    <CardFooter className="px-4 pt-3 pb-4 border-t border-border mt-3">
                      <div className="flex items-center w-full gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 flex items-center justify-center ${Number(room.room_status_id) === 4 ? 'bg-green-50 hover:bg-green-100 text-green-600' : 'bg-red-50 hover:bg-red-100 text-red-600'} border-border`}
                          onClick={() => toggleRoomStatus(room.roomnumber_id)}
                          disabled={status === 'Occupied'}
                        >
                          {Number(room.room_status_id) === 4 ? 'Enable' : 'Disable'}
                        </Button>
                      </div>
                    </CardFooter>
                    </Card>
                  )
                  })}
                </div>
              )}
            </>
          )}
      </div>
      
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Navigation buttons */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Image */}
            <div className="relative h-full bg-white/10 rounded-lg overflow-hidden">
              <img
                src={`${localStorage.url}images/${currentRoomImages[currentImageIndex]}`}
                alt={`Room image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {currentRoomImages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Type Modal */}
      <AdminModal
        isVisible={showEditModal}
        onClose={handleCloseEditModal}
        modalTitle={selectedRoomTypeForEdit ? `Edit ${selectedRoomTypeForEdit.name || selectedRoomTypeForEdit.roomtype_name}` : 'Edit Room Type'}
      >
        <div className="space-y-4 text-base text-gray-900 dark:text-white">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price</label>
            <Input
              type="number"
              step="0.01"
              value={editForm.price}
              onChange={(e) => handleEditFieldChange('price', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <Textarea
              value={editForm.description}
              onChange={(e) => handleEditFieldChange('description', e.target.value)}
              className="w-full min-h-[120px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleCloseEditModal} disabled={savingEdit}>Cancel</Button>
            <Button onClick={handleSaveRoomTypeEdit} disabled={savingEdit}>
              {savingEdit ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </AdminModal>

      {/* Room Numbers Modal */}
      {showRoomNumbersModal && selectedRoomTypeForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedRoomTypeForModal.name} - Room Numbers
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedRoomTypeForModal.rooms.length} rooms available
                </p>
              </div>
              <button
                onClick={() => setShowRoomNumbersModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {selectedRoomTypeForModal.rooms.map((room, index) => {
                  const status = monitoringMode
                    ? getCurrentRoomStatus(room)
                    : (isAvailableOnFilterRange(room) ? room.status_name : "Occupied")

                  return (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="w-full h-56 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 tracking-wide">
                              Room {room.roomnumber_id}
                            </div>
                          </div>
                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'Occupied' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : status === 'Vacant'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : status === 'Under-Maintenance'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : status === 'Dirty'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {status}
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-foreground">
                            {room.roomtype_name} — Room #{room.roomnumber_id} (Floor {room.roomfloor})
                          </h2>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <CardFooter className="px-4 pt-3 pb-4 border-t border-border mt-3">
                        <div className="flex items-center w-full gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`flex-1 flex items-center justify-center ${Number(room.room_status_id) === 4 ? 'bg-green-50 hover:bg-green-100 text-green-600' : 'bg-red-50 hover:bg-red-100 text-red-600'} border-border`}
                            onClick={() => toggleRoomStatus(room.roomnumber_id)}
                            disabled={status === 'Occupied' || updatingRoomStatus === room.roomnumber_id}
                          >
                            {updatingRoomStatus === room.roomnumber_id 
                              ? 'Updating...' 
                              : Number(room.room_status_id) === 4 ? 'Enable' : 'Disable'
                            }
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {selectedRoomTypeForModal.rooms.length}
                </span> rooms in {selectedRoomTypeForModal.name}
              </div>
              <Button
                onClick={() => setShowRoomNumbersModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default AdminRoomsList
