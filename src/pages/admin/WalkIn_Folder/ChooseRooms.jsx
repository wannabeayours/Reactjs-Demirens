import React, { useEffect, useState, useCallback } from 'react';
import AdminHeader from '../components/AdminHeader';
import { useNavigate } from 'react-router-dom';
import { useWalkIn } from './WalkInContext';
import axios from 'axios';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Search, ChevronDown } from 'lucide-react';

const ChooseRooms = () => {
  const baseUrl = (typeof window !== 'undefined' && window.localStorage) ? (localStorage.getItem('url') || `${window.location.origin}/`) : '';
  const APIConn = `${baseUrl}admin.php`;
  const navigate = useNavigate();

  const { walkInData, setWalkInData } = useWalkIn();

  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  // NEW: available counts per room type
  const [availableCounts, setAvailableCounts] = useState({});

  // Booking details state - extract date part from datetime strings
  const [checkIn, setCheckIn] = useState(() => {
    if (!walkInData.checkIn) return '';
    // If it's a datetime string, extract just the date part
    if (walkInData.checkIn.includes(' ')) {
      return walkInData.checkIn.split(' ')[0];
    }
    return walkInData.checkIn;
  });
  const [checkOut, setCheckOut] = useState(() => {
    if (!walkInData.checkOut) return '';
    // If it's a datetime string, extract just the date part
    if (walkInData.checkOut.includes(' ')) {
      return walkInData.checkOut.split(' ')[0];
    }
    return walkInData.checkOut;
  });
  const [adult, setAdult] = useState(walkInData.adult || 1);
  const [children, setChildren] = useState(walkInData.children || 0);

  // Multiple rooms selected
  const [selectedRooms, setSelectedRooms] = useState(walkInData.selectedRooms || []);

  // Extra filter state
  const [floor, setFloor] = useState('');

  // Incremental loading config
  const LOAD_STEP = 6;
  const [visibleCount, setVisibleCount] = useState(LOAD_STEP);

  // Availability helpers
  const parseDate = (str) => {
    if (!str) return null;
    try {
      // Handle both date strings and datetime strings
      const dateStr = str.includes(' ') ? str.split(' ')[0] : str;
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const fmt = (date) => {
    if (!date) return '';
    try {
      // Handle both Date objects and date strings
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().slice(0, 10);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };
  const tomorrow = fmt(addDays(new Date(), 1));
  const rangesOverlap = (startA, endA, startB, endB) => {
    // Treat as half-open interval [start, end)
    return startA < endB && endA > startB;
  };
  const isRoomAvailableForRange = (room, startStr, endStr) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return true; // no dates selected yet
    
    // Do NOT blanket-exclude currently occupied rooms; evaluate based on booking overlaps
    // Consider only active booking statuses
    const ACTIVE_STATUS = new Set(['Pending', 'Approved', 'Checked-In', 'Confirmed']);
    const bookings = Array.isArray(room.bookings) ? room.bookings : [];
    for (const b of bookings) {
      const statusName = b.status_name || b.booking_status || b.booking_status_name;
      if (statusName && !ACTIVE_STATUS.has(String(statusName))) continue; // ignore non-active bookings
      const bStartRaw = b.checkin_date || b.booking_checkin_dateandtime || b.booking_checkin || b.booking_checkin_date;
      const bEndRaw = b.checkout_date || b.booking_checkout_dateandtime || b.booking_checkout || b.booking_checkout_date;
      const bStart = parseDate(bStartRaw);
      const bEnd = parseDate(bEndRaw);
      if (!bStart || !bEnd) continue;
      if (rangesOverlap(start, end, bStart, bEnd)) return false;
    }
    return true;
  };

  // Date input handlers with validation
  const handleCheckInChange = (value) => {
    const newIn = value;
    const inDate = parseDate(newIn);
    const outDate = parseDate(checkOut);
    // enforce earliest check-in as tomorrow
    if (newIn && newIn < tomorrow) {
      const t = parseDate(tomorrow);
      const next = addDays(t, 1);
      setCheckIn(tomorrow);
      if (!outDate || t >= outDate) setCheckOut(fmt(next));
      return;
    }
    if (inDate && outDate && inDate >= outDate) {
      // auto-move checkout to next day
      const next = addDays(inDate, 1);
      setCheckIn(newIn);
      setCheckOut(fmt(next));
    } else {
      setCheckIn(newIn);
    }
  };

  const handleCheckOutChange = (value) => {
    const inDate = parseDate(checkIn);
    const outDate = parseDate(value);
    if (inDate && outDate && outDate <= inDate) {
      // force at least one night
      const next = addDays(inDate, 1);
      setCheckOut(fmt(next));
    } else {
      setCheckOut(value);
    }
  };

  const getRoomTypes = useCallback(async () => {
    const roomTypeReq = new FormData();
    roomTypeReq.append('method', 'viewRoomTypes');

    try {
      const res = await axios.post(APIConn, roomTypeReq);
      let data = res.data;
      // Handle cases where backend returns a JSON string
      try {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
      } catch (e) {
        console.error('Failed to parse room types JSON:', e, data);
        data = [];
      }

      // If no room types returned, fallback to deriving from viewRooms
      if (!Array.isArray(data) || data.length === 0) {
        const roomReq = new FormData();
        roomReq.append('method', 'viewRooms');
        try {
          const roomsRes = await axios.post(APIConn, roomReq);
          let roomsData = roomsRes.data;
          if (typeof roomsData === 'string') {
            try { roomsData = JSON.parse(roomsData); } catch { roomsData = []; }
          }
          if (Array.isArray(roomsData)) {
            const byType = {};
            roomsData.forEach(r => {
              const id = r.roomtype_id ?? r.room_type_id;
              if (!id) return;
              if (!byType[id]) {
                byType[id] = {
                  roomtype_id: id,
                  roomtype_name: r.roomtype_name,
                  roomtype_description: r.roomtype_description,
                  roomtype_price: Number(r.roomtype_price),
                  roomtype_capacity: r.roomtype_capacity,
                  roomtype_beds: r.roomtype_beds,
                  roomtype_sizes: r.roomtype_sizes,
                };
              }
            });
            const derived = Object.values(byType);
            setRoomTypes(derived);
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch rooms failed:', fallbackErr);
        }
      }

      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching room types:', err);
      setRoomTypes([]);
    }
  }, [APIConn]);

  // NEW: Fetch available rooms count per room type (same source as Dashboard)
  const fetchAvailableRoomsCounts = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'getAvailableRoomsCount');
      // Include selected dates for accurate, date-aware availability
      if (checkIn && checkOut) {
        const payload = { check_in: `${checkIn} 14:00:00`, check_out: `${checkOut} 12:00:00` };
        formData.append('json', JSON.stringify(payload));
      }
      const res = await axios.post(APIConn, formData);
      let payload = res.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      // Prefer the new by_roomtype mapping from backend if present
      const byType = payload && payload.by_roomtype ? payload.by_roomtype : null;
      if (byType && typeof byType === 'object') {
        setAvailableCounts(byType);
        return;
      }

      // Fallback to legacy named fields
      const colMap = {
        1: 'standard_twin_available',
        2: 'single_available',
        3: 'double_available',
        4: 'triple_available',
        5: 'quadruple_available',
        6: 'family_a_available',
        7: 'family_b_available',
        8: 'family_c_available',
      };
      const counts = {};
      Object.entries(colMap).forEach(([id, col]) => {
        counts[id] = Number(payload?.[col]) || 0;
      });
      setAvailableCounts(counts);
    } catch (error) {
      console.error('Failed to fetch available rooms counts:', error);
      setAvailableCounts({});
    }
  }, [APIConn, checkIn, checkOut]);

  useEffect(() => {
    getRoomTypes();
    fetchAvailableRoomsCounts();
    const interval = setInterval(fetchAvailableRoomsCounts, 30000);
    return () => clearInterval(interval);
  }, [getRoomTypes, fetchAvailableRoomsCounts]);

  useEffect(() => {
    fetchAvailableRoomsCounts();
  }, [checkIn, checkOut, fetchAvailableRoomsCounts]);

  const getRooms = useCallback(async () => {
    if (selectedRoomTypes.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const roomReq = new FormData();
    roomReq.append('method', 'viewRooms');

    try {
      const res = await axios.post(APIConn, roomReq);
      const allRooms = Array.isArray(res.data) ? res.data : [];
      
      // Build a fallback mapping from room type name -> id (as string) using loaded roomTypes
      const nameToId = new Map(
        (Array.isArray(roomTypes) ? roomTypes : []).map(rt => [rt.roomtype_name, String(rt.roomtype_id)])
      );
      
      // Filter rooms by selected room types using roomtype_id when present,
      // and fallback to mapping via roomtype_name -> roomtype_id when id is missing
      const filteredRooms = allRooms.filter(room => {
        const roomTypeIdRaw = room.roomtype_id ?? room.room_type_id;
        let roomTypeId = roomTypeIdRaw != null ? String(roomTypeIdRaw) : null;
        if (!roomTypeId && room.roomtype_name && nameToId.has(room.roomtype_name)) {
          roomTypeId = nameToId.get(room.roomtype_name);
        }
        return roomTypeId && selectedRoomTypes.includes(roomTypeId);
      });
      
      setRooms(filteredRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [APIConn, selectedRoomTypes, roomTypes]);

  useEffect(() => {
    getRoomTypes();
  }, [getRoomTypes]);

  useEffect(() => {
    setLoading(true);
    getRooms();
  }, [getRooms]);

  // Toggle selection of a room
  const toggleRoomSelection = (room) => {
    const exists = selectedRooms.some(r => r.id === room.roomnumber_id);
    if (exists) {
      setSelectedRooms(prev => prev.filter(r => r.id !== room.roomnumber_id));
    } else {
      // Use the roomtype_id directly from the room object
      const roomTypeId = room.roomtype_id ?? room.room_type_id;
      // Rely on date-based availability check rather than aggregate counts
      const canSelect = isRoomAvailableForRange(room, checkIn, checkOut);
      if (!canSelect) {
        alert("This room is not available for the selected dates. Please choose a different room or adjust your dates.");
        return;
      }
      
      setSelectedRooms(prev => [...prev, {
        id: room.roomnumber_id,
        roomnumber_id: room.roomnumber_id,
        roomtype_id: roomTypeId,
        name: room.roomtype_name,
        roomtype_name: room.roomtype_name,
        price: Number(room.roomtype_price),
        roomtype_price: Number(room.roomtype_price),
        floor: room.roomfloor,
        roomfloor: room.roomfloor,
        capacity: room.roomtype_capacity,
        roomtype_capacity: room.roomtype_capacity,
        beds: room.roomtype_beds,
        roomtype_beds: room.roomtype_beds,
        size: room.roomtype_sizes,
        roomtype_sizes: room.roomtype_sizes,
        description: room.roomtype_description,
        roomtype_description: room.roomtype_description,
        status_name: room.status_name,
        images: room.images
      }]);
    }
  };

  // Check if a room is selected
  const isRoomSelected = (room) => {
    return selectedRooms.some(r => r.id === room.roomnumber_id);
  };

  const handleConfirm = () => {
    if (selectedRoomTypes.length === 0) {
      alert("Please select at least one room type before continuing.");
      return;
    }
    if (!checkIn || !checkOut) {
      alert("Please select both Check-In and Check-Out dates before continuing.");
      return;
    }
    if (selectedRooms.length === 0) {
      alert("Please select at least one room.");
      return;
    }

    // Set fixed times: 2:00 PM check-in, 12:00 PM check-out
    const checkInDateTime = new Date(checkIn);
    checkInDateTime.setHours(14, 0, 0, 0); // 2:00 PM
    
    const checkOutDateTime = new Date(checkOut);
    checkOutDateTime.setHours(12, 0, 0, 0); // 12:00 PM

    // Format dates manually to avoid timezone issues
    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedCheckIn = formatDateTime(checkInDateTime);
    const formattedCheckOut = formatDateTime(checkOutDateTime);

    console.log('ChooseRooms - Setting times:', {
      originalCheckIn: checkIn,
      originalCheckOut: checkOut,
      formattedCheckIn,
      formattedCheckOut
    });

    setWalkInData({
      ...walkInData,
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      adult,
      children,
      selectedRooms,
      selectedRoomTypes,
    });

    navigate('/admin/add-walk-in');
  };

  // Toggle room type selection
  const toggleRoomTypeSelection = (roomTypeId) => {
    setSelectedRoomTypes(prev => {
      if (prev.includes(roomTypeId)) {
        return prev.filter(id => id !== roomTypeId);
      } else {
        return [...prev, roomTypeId];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFloor('');
    setAdult(1);
    setChildren(0);
    setSelectedRoomTypes([]);
  };

  // Total guests
  const totalGuests = adult + children;

  // Filter rooms by dates + search + guest count + floor (status ignored)
  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomtype_description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGuests = totalGuests ? room.roomtype_capacity >= totalGuests : true;
    const matchesFloor = floor ? room.roomfloor === Number(floor) : true;

    const availableOnDates = isRoomAvailableForRange(room, checkIn, checkOut);

    return matchesSearch && matchesGuests && matchesFloor && availableOnDates;
  });

  // Visible subset of rooms
  const visibleRooms = filteredRooms.slice(0, visibleCount);

  // Reset visible rooms when filters / inputs change
  useEffect(() => {
    setVisibleCount(LOAD_STEP);
  }, [searchTerm, floor, checkIn, checkOut, adult, children, selectedRoomTypes, rooms.length]);

  // Scroll to bottom handler
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <AdminHeader />
      <div className="lg:ml-72 p-6 max-w-5xl mx-auto relative">
        {/* Floating Button */}
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={28} />
        </button>

        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Walk-In — Step 1: Choose Room
        </h1>

        {/* Booking Details Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={tomorrow}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              min={checkIn ? fmt(addDays(parseDate(checkIn), 1)) : fmt(new Date())}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adults</label>
            <input
              type="number"
              min="1"
              value={adult}
              onChange={(e) => setAdult(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Children</label>
            <input
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Room Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Room Types <span className="text-red-500">*</span>
            <span className="text-sm text-gray-500 ml-2">(You can select multiple types)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roomTypes.map(roomType => (
              <div
                key={roomType.roomtype_id}
                onClick={() => toggleRoomTypeSelection(roomType.roomtype_id.toString())}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRoomTypes.includes(roomType.roomtype_id.toString())
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {roomType.roomtype_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Capacity: {roomType.roomtype_capacity} | Beds: {roomType.roomtype_beds}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Size: {roomType.roomtype_sizes}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ₱{roomType.roomtype_price}
                    </p>
                    {selectedRoomTypes.includes(roomType.roomtype_id.toString()) && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">Selected</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {roomType.roomtype_description}
                </p>
              </div>
            ))}
          </div>
          {selectedRoomTypes.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedRoomTypes.length} room type(s)
              </p>
            </div>
          )}
        </div>

        {/* Filter Controls - Only show when room types are selected */}
        {selectedRoomTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Floor</label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Floors</option>
                {[...new Set(rooms.map(r => r.roomfloor))].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {selectedRoomTypes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Please select at least one room type to view available rooms</p>
          </div>
        ) : loading ? (
          <p className="text-center text-gray-500">Loading rooms...</p>
        ) : filteredRooms.length === 0 ? (
          <p className="text-center text-red-500 font-semibold">No Available Rooms</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRooms.map((room, index) => {
              const imageArray = room.images
                ? room.images.split(",").map(img => img.trim())
                : [];

              return (
                <div
                  key={index}
                  className="border rounded-xl shadow-md hover:shadow-lg transition bg-white dark:bg-gray-900 overflow-hidden"
                >
                  {/* Image Carousel */}
                  <Carousel className="relative w-full">
                    <CarouselContent>
                      {imageArray.length > 0 ? (
                        imageArray.map((img, i) => (
                          <CarouselItem key={i}>
                            <div className="relative">
                              <img
                                src={`${localStorage.url}images/${img}`}
                                alt={room.roomtype_name}
                                className="w-full h-56 object-cover"
                              />
                              {/* Room number overlay */}
                              <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                Room #{room.roomnumber_id}
                              </span>
                            </div>
                          </CarouselItem>
                        ))
                      ) : (
                        <CarouselItem>
                          <div className="relative w-full h-56 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {/* Room number overlay */}
                            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              Room #{room.roomnumber_id}
                            </span>
                            No Image
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>

                  {/* Room Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{room.roomtype_name}</h3>
                      <span className="text-green-600 dark:text-green-400 font-bold">₱{Number(room.roomtype_price)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Capacity: {room.roomtype_capacity} | Beds: {room.roomtype_beds} | Size: {room.roomtype_sizes}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                      {room.roomtype_description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        Floor: {room.roomfloor}
                      </span>
                      <button
                        onClick={() => toggleRoomSelection(room)}
                        disabled={!isRoomAvailableForRange(room, checkIn, checkOut) && !isRoomSelected(room)}
                        className={`${isRoomSelected(room) ? 'bg-red-600 hover:bg-red-700' : (!isRoomAvailableForRange(room, checkIn, checkOut) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700')} text-white px-4 py-2 rounded`}
                      >
                        {isRoomSelected(room) ? 'Remove' : (!isRoomAvailableForRange(room, checkIn, checkOut) ? 'Fully Booked' : 'Select')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {(visibleCount > LOAD_STEP || visibleCount < filteredRooms.length) && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center gap-3">
                {visibleCount > LOAD_STEP && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => Math.max(LOAD_STEP, prev - LOAD_STEP))}
                    className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Show Less
                  </button>
                )}
                {visibleCount < filteredRooms.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => Math.min(prev + LOAD_STEP, filteredRooms.length))}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    See More Rooms
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Confirm button - Only show when room types are selected */}
        {selectedRoomTypes.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleConfirm}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Continue to Customer Info
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChooseRooms;
