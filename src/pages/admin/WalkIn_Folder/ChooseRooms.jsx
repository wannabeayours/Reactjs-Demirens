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
  const APIConn = `${localStorage.url}admin.php`;
  const navigate = useNavigate();

  const { walkInData, setWalkInData } = useWalkIn();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Booking details state
  const [checkIn, setCheckIn] = useState(walkInData.checkIn || '');
  const [checkOut, setCheckOut] = useState(walkInData.checkOut || '');
  const [adult, setAdult] = useState(walkInData.adult || 1);
  const [children, setChildren] = useState(walkInData.children || 0);

  // Multiple rooms selected
  const [selectedRooms, setSelectedRooms] = useState(walkInData.selectedRooms || []);

  // Extra filter state
  const [floor, setFloor] = useState('');

  // Availability helpers
  const parseDate = (str) => (str ? new Date(str + 'T00:00:00') : null);
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const fmt = (date) => (date ? date.toISOString().slice(0, 10) : '');
  const tomorrow = fmt(addDays(new Date(), 1));
  const rangesOverlap = (startA, endA, startB, endB) => {
    // Treat as half-open interval [start, end)
    return startA < endB && endA > startB;
  };
  const isRoomAvailableForRange = (room, startStr, endStr) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return true; // no dates selected yet
    const bookings = Array.isArray(room.bookings) ? room.bookings : [];
    for (const b of bookings) {
      const bStart = parseDate(b.checkin_date);
      const bEnd = parseDate(b.checkout_date);
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

  const getRooms = useCallback(async () => {
    const roomReq = new FormData();
    roomReq.append('method', 'viewRooms');

    try {
      const res = await axios.post(APIConn, roomReq);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [APIConn]);

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
      setSelectedRooms(prev => [...prev, {
        id: room.roomnumber_id,
        roomnumber_id: room.roomnumber_id,
        roomtype_id: room.roomtype_id,
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
        status_name: room.status_name
      }]);
    }
  };

  // Check if a room is selected
  const isRoomSelected = (room) => {
    return selectedRooms.some(r => r.id === room.roomnumber_id);
  };

  const handleConfirm = () => {
    if (!checkIn || !checkOut) {
      alert("Please select both Check-In and Check-Out dates before continuing.");
      return;
    }
    if (selectedRooms.length === 0) {
      alert("Please select at least one room.");
      return;
    }

    setWalkInData({
      ...walkInData,
      checkIn,
      checkOut,
      adult,
      children,
      selectedRooms,
    });

    navigate('/admin/add-walk-in');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFloor('');
    setAdult(1);
    setChildren(0);
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

  // Scroll to bottom handler
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 max-w-5xl mx-auto relative">
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

        {/* Filter Controls */}
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

        {loading ? (
          <p className="text-center text-gray-500">Loading rooms...</p>
        ) : filteredRooms.length === 0 ? (
          <p className="text-center text-red-500 font-semibold">No Available Rooms</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.map((room, index) => {
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
                            <img
                              src={`http://localhost/demirenAPI/images/${img}`}
                              alt={room.roomtype_name}
                              className="w-full h-56 object-cover"
                            />
                          </CarouselItem>
                        ))
                      ) : (
                        <CarouselItem>
                          <div className="w-full h-56 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                              Images Unavailable
                            </span>
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>

                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow p-1 hover:bg-white dark:hover:bg-gray-700" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow p-1 hover:bg-white dark:hover:bg-gray-700" />
                  </Carousel>

                  {/* Room Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {room.roomtype_name} - Room #{room.roomnumber_id} (Floor {room.roomfloor})
                      </h2>
                      <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                        ₱{room.roomtype_price}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {room.roomtype_description}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Capacity: {room.roomtype_capacity}
                    </p>

                    {/* Availability/Conflict badge */}
                    {checkIn && checkOut && (
                      <div className="mt-2">
                        {isRoomAvailableForRange(room, checkIn, checkOut) ? (
                          <span className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            Available on selected dates
                          </span>
                        ) : (
                          <span className="inline-block text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                            Conflict with existing booking
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => toggleRoomSelection(room)}
                      className={`mt-3 px-4 py-2 rounded text-white ${isRoomSelected(room) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                    >
                      {isRoomSelected(room) ? 'Selected' : 'Select Room'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleConfirm}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Continue to Customer Info
          </button>
        </div>
      </div>
    </>
  );
};

export default ChooseRooms;
