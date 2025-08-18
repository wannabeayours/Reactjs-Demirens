import React, { useEffect, useState } from 'react';
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
import { Search } from 'lucide-react';

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
  const [guests, setGuests] = useState(walkInData.guests || 1);

  // Multiple rooms selected
  const [selectedRooms, setSelectedRooms] = useState(walkInData.selectedRooms || []);

  const getRooms = async () => {
    const roomReq = new FormData();
    roomReq.append('method', 'view_rooms');

    try {
      const res = await axios.post(APIConn, roomReq);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getRooms();
  }, []);

  // Toggle selection of a room
  const toggleRoomSelection = (room) => {
    const exists = selectedRooms.some(r => r.id === room.roomnumber_id);
    if (exists) {
      setSelectedRooms(prev => prev.filter(r => r.id !== room.roomnumber_id));
    } else {
      setSelectedRooms(prev => [...prev, {
        id: room.roomnumber_id,
        name: room.roomtype_name,
        price: Number(room.roomtype_price),
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
      guests,
      selectedRooms,
    });

    navigate('/admin/payment-method');
  };

  // Filter rooms by search term
  const filteredRooms = rooms.filter(room =>
    room.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomtype_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminHeader />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Walk-In — Step 2: Choose Room
        </h1>

        {/* Booking Details Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guests</label>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
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
                      Capacity: {room.room_capacity}
                    </p>

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
            Continue to Payment
          </button>
        </div>
      </div>
    </>
  );
};

export default ChooseRooms;
