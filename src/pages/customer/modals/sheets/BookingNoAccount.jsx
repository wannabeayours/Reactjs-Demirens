import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BedDouble, Info, MinusIcon, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link } from 'react-router-dom'
import ConfirmBooking from '../ConfirmBooking'
import Moreinfo from './Moreinfo'
import { Badge } from '@/components/ui/badge'

function BookingNoaccount({ handleGetSummaryInfo, rooms, selectedRoom, handleClearData, adultNumber, childrenNumber }) {
  const [allRooms, setAllRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(new Date())
  const [checkOut, setCheckOut] = useState(new Date())
  const [numberOfNights, setNumberOfNights] = useState(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState(null);
  // const [extraBedCounts, setExtraBedCounts] = useState({});
  const [guestCounts, setGuestCounts] = useState({});
  const [adultCounts, setAdultCounts] = useState({});
  const [childrenCounts, setChildrenCounts] = useState({});
  const [walkinfirstname, setWalkinfirstname] = useState("");
  const [walkinlastname, setWalkinlastname] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [guests, setGuests] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Form validation states
  const [errors, setErrors] = useState({
    walkinfirstname: "",
    walkinlastname: "",
    email: "",
    contactNumber: ""
  });



  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      walkinfirstname: "",
      walkinlastname: "",
      email: "",
      contactNumber: ""
    };

    // Validate first name
    if (!walkinfirstname.trim()) {
      newErrors.walkinfirstname = "First name is required";
      isValid = false;
    }

    // Validate last name
    if (!walkinlastname.trim()) {
      newErrors.walkinlastname = "Last name is required";
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    // Validate contact number
    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const customerBookingNoAccount = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    try {
      const url = localStorage.getItem('url') + "customer.php";
      const customerId = localStorage.getItem("userId");
      const childrenNumber = localStorage.getItem("children");
      const adultNumber = localStorage.getItem("adult");
      const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0)
      const displayedVat = subtotal - (subtotal / 1.12)
      const totalAmount = subtotal.toFixed(2)
      const downPayment = (subtotal * 0.5).toFixed(2)
      const bookingDetails = {
        "checkIn": checkIn,
        "checkOut": checkOut,
        "downpayment": downPayment,
        "totalAmount": totalAmount,
        "displayedVat": displayedVat.toFixed(2),
        "children": childrenNumber,
        "adult": adultNumber
      }
      console.log("selected rooms", selectedRooms)
      console.log("adultCounts", adultCounts)
      console.log("childrenCounts", childrenCounts)
      const roomDetails = selectedRooms.map((room) => {
        const adultCount = adultCounts[room.room_type] || 0;
        const childrenCount = childrenCounts[room.room_type] || 0;
        console.log(`Room ${room.roomtype_name}: adults=${adultCount}, children=${childrenCount}`)
        return {
          roomTypeId: room.room_type,
          guestCount: adultCount + childrenCount,
          adultCount: adultCount,
          childrenCount: childrenCount,
        };
      });

      console.log("roomDetails", roomDetails);
      const jsonData = {
        walkinfirstname: walkinfirstname,
        walkinlastname: walkinlastname,
        email: email,
        contactNumber: contactNumber,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      console.log("jsondata", jsonData)
      const formData = new FormData();
      formData.append("operation", "customerBookingNoAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res ni no account", res);
      if (res.data === 1) {
        toast.success("Booking successful");
        setOpen(false);
        localStorage.removeItem('checkIn')
        localStorage.removeItem('checkOut')
        setSelectedRooms([]);
        setAdultCounts({});
        setChildrenCounts({});
        // setExtraBedCounts({});
        setGuestCounts({});
        handleClearData();
        // Set a flag to trigger refresh in CustomerViewBookings
        localStorage.setItem('refreshBookings', Date.now().toString());
      }
      else {
        toast.error("Booking error");
      }


    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  useEffect(() => {
    // Handle responsive layout
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkInStr = localStorage.getItem('checkIn');
    const checkOutStr = localStorage.getItem('checkOut');
    const guestNum = parseInt(localStorage.getItem('guestNumber'));
    const storedAdult = parseInt(localStorage.getItem('adult')) || 1;
    const storedChildren = parseInt(localStorage.getItem('children'));

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);

    // ✅ Normalize to midnight so we only compare dates (ignore time)
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    setCheckIn(checkInDate);
    setCheckOut(checkOutDate);

    // ✅ Get number of nights (at least 1 night)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.max(1, diffTime / (1000 * 60 * 60 * 24));
    setNumberOfNights(diffDays);

    setAllRooms(rooms);
    console.log("SELECTED ROOooooooooooM", selectedRoom);

    const selected = {
      roomtype_name: selectedRoom.roomtype_name,
      roomtype_price: selectedRoom.roomtype_price,
      room_type: selectedRoom.roomtype_id,
      roomtype_description: selectedRoom.roomtype_description,
      room_capacity: selectedRoom.roomtype_capacity,
      // Add a unique identifier for each selected room instance
      unique_id: `${selectedRoom.roomtype_id}_${Date.now()}`
    };

    setSelectedRooms(prev => {
      const isAlreadySelected = prev.some(room => room.room_type === selected.room_type);
      if (isAlreadySelected) {
        return prev; // Don't add duplicate
      }
      return [...prev, selected]; // Add new room
    });

    // ✅ Clamp guest number to max_capacity
    const validGuestNum = Math.min(guestNum, selected.room_capacity);
    setGuestCounts(prev => ({
      ...prev,
      [selected.unique_id]: validGuestNum
    }));

    // Initialize adults
    const initialAdult = Number.isFinite(storedAdult)
      ? Math.max(0, storedAdult)
      : (typeof adultNumber === 'number' ? Math.max(0, adultNumber) : 0);

    const initAdults = adultNumber || parseInt(storedAdult) || 1;
    const initChildren = childrenNumber || parseInt(storedChildren) || 0;

    setAdultCounts(prev => ({
      ...prev,
      [selected.unique_id]: initAdults
    }));

    setChildrenCounts(prev => ({
      ...prev,
      [selected.unique_id]: initChildren
    }));


  }, [open, rooms, selectedRoom, adultNumber, childrenNumber]);


  useEffect(() => {
    setGuestCounts(prev => {
      const updated = { ...prev };
      selectedRooms.forEach(room => {
        const roomKey = room.unique_id || room.room_type;
        if (!updated[roomKey]) {
          updated[roomKey] = Math.min(
            parseInt(localStorage.getItem('guestNumber')) || 1,
            room.room_capacity || 1
          );
        }
      });
      return updated;
    });

    // Initialize adult and children counts for new rooms
    setAdultCounts(prev => {
      const updated = { ...prev };
      selectedRooms.forEach(room => {
        const roomKey = room.unique_id || room.room_type;
        if (!updated[roomKey]) {
          const storedAdult = parseInt(localStorage.getItem('adult')) || 1;
          updated[roomKey] = Math.min(
            Math.max(0, storedAdult),
            room.room_capacity || Number.MAX_SAFE_INTEGER
          );
        }
      });
      return updated;
    });

    setChildrenCounts(prev => {
      const updated = { ...prev };
      selectedRooms.forEach(room => {
        const roomKey = room.unique_id || room.room_type;
        if (!updated[roomKey]) {
          const storedChildren = parseInt(localStorage.getItem('children')) || 0;
          // 使用固定的初始值，避免依赖adultCounts
          const storedAdult = parseInt(localStorage.getItem('adult')) || 1;
          const remainingCapacity = Math.max(0, (room.room_capacity || Number.MAX_SAFE_INTEGER) - storedAdult);
          updated[roomKey] = Math.min(storedChildren, remainingCapacity);
        }
      });
      return updated;
    });
  }, [selectedRooms]);

  const handleRemoveRoom = (indexRemove) => {
    const roomToRemove = selectedRooms[indexRemove];
    const updatedRooms = selectedRooms.filter((_, index) => index !== indexRemove);
    setSelectedRooms(updatedRooms);

    // Clean up guest counts for removed room
    if (roomToRemove) {
      const roomKey = roomToRemove.unique_id || roomToRemove.room_type;
      setGuestCounts(prev => {
        const updated = { ...prev };
        delete updated[roomKey];
        return updated;
      });
      setAdultCounts(prev => {
        const updated = { ...prev };
        delete updated[roomKey];
        return updated;
      });
      setChildrenCounts(prev => {
        const updated = { ...prev };
        delete updated[roomKey];
        return updated;
      });
    }

    if (updatedRooms.length === 0) {
      setNumberOfNights(1);
      toast.info("Room selection cleared!");
    } else {
      toast.info("Room removed.");
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false)
  }

  const openConfirmModal = () => {
    setShowConfirmModal(true);
  }

  useEffect(() => {
    console.log("rooms", selectedRooms);
  }, [selectedRooms])

  // ✅ Add this after your states
  useEffect(() => {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.max(1, diffTime / (1000 * 60 * 60 * 24)); // at least 1 night
    setNumberOfNights(diffDays);
  }, [checkIn, checkOut]); // runs whenever dates change

  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // local midnight
  }

  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return (
    <>
      <div>
        <div className="text-black border-none rounded-t-3xl bg-white">
          <div className="h-[100vh] md:h-[calc(100vh-100px)] flex flex-col" >
            {/* Sticky check-in/check-out section with enhanced styling */}
            <div className="sticky top-0 z-10 bg-white pb-2 shadow-lg rounded-lg mb-2">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2">
                    {/* ✅ Check-in input with enhanced styling */}
                    <div className="flex flex-col">
                      <Label htmlFor="checkin" className="mb-1 font-semibold text-blue-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Check-in
                      </Label>
                      <Input
                        id="checkin"
                        type="date"
                        value={formatDateLocal(checkIn)}
                        min={formatDateLocal(new Date())}
                        onChange={(e) => {
                          const newDate = parseLocalDate(e.target.value);
                          setCheckIn(newDate);
                        }}
                        className="border-blue-300 focus:border-blue-500 rounded-md shadow hover:shadow-md hover:border-blue-400 transition-all w-full bg-white"
                      />
                    </div>

                    {/* ✅ Check-out input with enhanced styling */}
                    <div className="flex flex-col">
                      <Label htmlFor="checkout" className="mb-1 font-semibold text-blue-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Check-out
                      </Label>
                      <Input
                        id="checkout"
                        type="date"
                        value={formatDateLocal(checkOut)}
                        min={formatDateLocal(checkIn)}
                        onChange={(e) => {
                          const newDate = parseLocalDate(e.target.value);
                          setCheckOut(newDate);
                        }}
                        className="border-blue-300 focus:border-blue-500 rounded-md shadow hover:shadow-md hover:border-blue-400 transition-all bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-lg shadow-md">
                      {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 mt-2 flex-1 overflow-auto">
              {/* LEFT SIDE: Selected Rooms (scrollable) */}
              <Card className="bg-white shadow-xl text-black w-full rounded-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-2 sm:p-4">

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full shadow-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Selected Rooms: {selectedRooms.length}
                      </div>
                      <div>
                        <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
                      </div>
                    </div>

                  </div>
                  <Card className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-sm border border-blue-200">
                    <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-280px)]">
                      <div className="p-3">
                        {selectedRooms.length > 0 ? (
                          <div>
                            {selectedRooms.map((room, index) => (
                              <Card key={index} className="mb-4 mx-2 rounded-xl overflow-hidden border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                                <CardContent className="p-5">
                                  <div className="flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                                      onClick={() => handleRemoveRoom(index)}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div>
                                      <h1 className="font-semibold text-2xl font-playfair text-blue-700 mb-2">{room.roomtype_name}</h1>
                                      <p className="text-gray-700 text-sm mb-3">{room.roomtype_description}</p>
                                      <Link>
                                        <div className="flex flex-row space-x-2 mt-2 mb-3">
                                          <div>
                                            <Moreinfo room={room} />
                                          </div>
                                          <div className="text-blue-600 hover:text-blue-800 transition-colors">
                                            <Info />
                                          </div>
                                        </div>
                                      </Link>
                                      <div className="flex items-center gap-2 font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg inline-block shadow-sm border border-blue-100">
                                        <BedDouble size={20} />
                                        ₱ {Number(room.roomtype_price).toLocaleString('en-PH', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}/day
                                      </div>
                                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-blue-100 p-4 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                                          <div className="flex items-center">
                                            <Label className="mb-2 font-medium text-blue-700 flex items-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                              </svg>
                                              Adults
                                            </Label>
                                          </div>
                                          <div className="flex items-center justify-between gap-2 mt-1">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="rounded-full h-10 w-10 flex items-center justify-center border-blue-300 hover:bg-blue-100 transition-colors shadow-sm"
                                              onClick={() => {
                                                const roomKey = room.unique_id || room.room_type;
                                                const current = adultCounts[roomKey] || 0;
                                                setAdultCounts(prev => ({
                                                  ...prev,
                                                  [roomKey]: Math.max(0, current - 1)
                                                }));
                                              }}
                                              disabled={(adultCounts[room.unique_id || room.room_type] || 0) <= 1}
                                            >
                                              <MinusIcon className="h-5 w-5" />
                                            </Button>
                                            <span className="text-xl font-semibold text-blue-700 min-w-[40px] text-center bg-blue-50 py-1 px-2 rounded-md">
                                              {adultCounts[room.unique_id || room.room_type] || 0}
                                            </span>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="rounded-full h-10 w-10 flex items-center justify-center border-blue-300 hover:bg-blue-100 transition-colors shadow-sm"
                                              onClick={() => {
                                                // Get the current counts for THIS specific room only
                                                const roomKey = room.unique_id || room.room_type;
                                                const current = adultCounts[roomKey] || 0;
                                                const currentChildren = childrenCounts[roomKey] || 0;

                                                // Check capacity for THIS room only
                                                if ((current + currentChildren) < (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)) {
                                                  // Update only THIS room's count
                                                  setAdultCounts(prev => ({
                                                    ...prev,
                                                    [roomKey]: current + 1
                                                  }));
                                                }
                                              }}
                                              disabled={((adultCounts[room.unique_id || room.room_type] || 0) + (childrenCounts[room.unique_id || room.room_type] || 0)) >= (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)}
                                            >
                                              <Plus className="h-5 w-5" />
                                            </Button>
                                          </div>
                                          <div className="mt-2 text-right text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block ml-auto">
                                            Max capacity: {room.roomtype_capacity || 0}
                                          </div>
                                        </div>

                                        <div className="rounded-xl border border-blue-100 p-4 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                                          <div className="flex items-center">
                                            <Label className="mb-2 font-medium text-blue-700 flex items-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                              </svg>
                                              Children
                                            </Label>
                                          </div>
                                          <div className="flex items-center justify-between gap-2 mt-1">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="rounded-full h-10 w-10 flex items-center justify-center border-blue-300 hover:bg-blue-100 transition-colors shadow-sm"
                                              onClick={() => {
                                                const roomKey = room.unique_id || room.room_type;
                                                const current = childrenCounts[roomKey] || 0;
                                                setChildrenCounts(prev => ({
                                                  ...prev,
                                                  [roomKey]: Math.max(0, current - 1)
                                                }));
                                              }}
                                              disabled={(childrenCounts[room.unique_id || room.room_type] || 0) <= 0}
                                            >
                                              <MinusIcon className="h-5 w-5" />
                                            </Button>
                                            <span className="text-xl font-semibold text-blue-700 min-w-[40px] text-center bg-blue-50 py-1 px-2 rounded-md">
                                              {childrenCounts[room.unique_id || room.room_type] || 0}
                                            </span>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="rounded-full h-10 w-10 flex items-center justify-center border-blue-300 hover:bg-blue-100 transition-colors shadow-sm"
                                              onClick={() => {
                                                const roomKey = room.unique_id || room.room_type;
                                                const current = childrenCounts[roomKey] || 0;
                                                const currentAdults = adultCounts[roomKey] || 0;
                                                if ((currentAdults + current) < (room.room_capacity || Number.MAX_SAFE_INTEGER)) {
                                                  setChildrenCounts(prev => ({
                                                    ...prev,
                                                    [roomKey]: current + 1
                                                  }));
                                                }
                                              }}
                                              disabled={((adultCounts[room.unique_id || room.room_type] || 0) + (childrenCounts[room.unique_id || room.room_type] || 0)) >= (room.room_capacity || Number.MAX_SAFE_INTEGER)}
                                            >
                                              <Plus className="h-5 w-5" />
                                            </Button>
                                          </div>
                                          <div className="mt-2 text-right text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block ml-auto">
                                            Remaining: {Math.max(0, (room.roomtype_capacity || 0) - ((adultCounts[room.unique_id || room.room_type] || 0) + (childrenCounts[room.unique_id || room.room_type] || 0)))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg text-blue-700 inline-block">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Total guests: <span className="font-semibold">{(adultCounts[room.unique_id || room.room_type] || 0) + (childrenCounts[room.unique_id || room.room_type] || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>

                                {/* <Separator className="w-full mt-4" /> */}
                              </Card>

                            ))}
                          </div>
                        ) : (
                          <p>No rooms selected</p>
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-xl text-black w-full rounded-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-2 sm:p-4">
                  <div className="grid grid-cols-1 gap-4 mb-3">
                    <div className="flex flex-col gap-4">
                      <div className="text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full shadow-sm flex items-center w-52">                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                        Customer Information
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4 md:mb-0">
                          <div className="space-y-2">
                            <Label htmlFor="walkinfirstname" className="font-medium text-blue-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              First Name
                            </Label>
                            <Input
                              id="walkinfirstname"
                              placeholder="Enter your first name"
                              value={walkinfirstname}
                              onChange={(e) => setWalkinfirstname(e.target.value)}
                              className="border-blue-300 focus:border-blue-500 rounded-md shadow hover:shadow-md hover:border-blue-400 transition-all w-full bg-white"
                            />
                            {errors.walkinfirstname && (
                              <p className="text-sm font-medium text-red-500 mt-1 flex items-center bg-red-50 p-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {errors.walkinfirstname}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <Label htmlFor="walkinlastname" className="font-medium text-blue-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Last Name
                            </Label>
                            <Input
                              id="walkinlastname"
                              placeholder="Enter your last name"
                              value={walkinlastname}
                              onChange={(e) => setWalkinlastname(e.target.value)}
                              className="border-blue-300 focus:border-blue-500 rounded-md shadow hover:shadow-md hover:border-blue-400 transition-all w-full bg-white"
                            />
                            {errors.walkinlastname && (
                              <p className="text-sm font-medium text-red-500 mt-1 flex items-center bg-red-50 p-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {errors.walkinlastname}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="font-medium text-blue-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </Label>
                            <Input
                              id="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-blue-300 focus:border-blue-500 rounded-md shadow hover:shadow-md hover:border-blue-400 transition-all w-full bg-white"
                            />
                            {errors.email && (
                              <p className="text-sm font-medium text-red-500 mt-1 flex items-center bg-red-50 p-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {errors.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <Label htmlFor="contactNumber" className="font-medium text-blue-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Contact Number
                            </Label>
                            <Input
                              id="contactNumber"
                              placeholder="Enter your contact number"
                              value={contactNumber}
                              onChange={(e) => setContactNumber(e.target.value)}
                              className="border-blue-300 focus:border-blue-500 rounded-md shadow hover:shadow-md hover:border-blue-400 transition-all w-full bg-white"
                            />
                            {errors.contactNumber && (
                              <p className="text-sm font-medium text-red-500 mt-1 flex items-center bg-red-50 p-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {errors.contactNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-280px)]">
                        <div className="p-3 ">

                          <div className=" flex justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-600 text-white p-3 rounded-lg shadow-md">
                            <div className="text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full shadow-sm flex items-center w-52 ">                       
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                              Booking Summary
                            </div>
                            <div className="text-sm bg-white text-blue-700 font-medium px-3 py-1 rounded-full shadow-sm ">
                              {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''} Selected
                            </div>
                          </div>
                          <Card className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-sm border border-blue-200 mt-2 mb-2">
                            <div className="p-3">
                              <ScrollArea className="h-52">
                                {selectedRooms.length > 0 && selectedRooms.map((room, index) => (
                                  <Card key={index} className="mb-3 shadow-md rounded-lg border border-blue-100 overflow-hidden">
                                    <CardContent className="p-3">
                                      <CardTitle className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 p-2 rounded-md mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Room {index + 1}
                                      </CardTitle>
                                      <div className="flex flex-row justify-between items-center py-2">
                                        <h2 className="font-medium text-lg text-blue-700">{room.roomtype_name}</h2>

                                        <p className="font-semibold text-lg bg-blue-50 p-2 rounded-md shadow-sm">
                                          {`${numberOfNights} Day(s) x ₱${room.roomtype_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </p>
                                      </div>
                                      <p className="text-md font-semibold text-right text-white bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-md shadow">
                                        = ₱{(numberOfNights * room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </ScrollArea>
                            </div>
                          </Card>
                          {(() => {
                            const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
                            const vat = subtotal - (subtotal / 1.12);
                            const total = subtotal
                            const down = total * 0.5
                            return (
                              <>

                                <div className="flex justify-between items-center py-2 bg-blue-50 p-2 rounded-md">
                                  <span className="font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                    </svg>
                                    VAT (12%) included:
                                  </span>
                                  <span className="font-semibold text-blue-700">₱ {vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-md shadow-md">
                                  <span className="font-bold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                    Total (VAT included):
                                  </span>
                                  <span className="font-bold text-xl bg-white text-blue-700 px-3 py-1 rounded-md shadow">₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 bg-blue-100 p-3 rounded-md shadow-sm border border-blue-200">
                                  <span className="font-medium flex items-center text-blue-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Down Payment (50% required):
                                  </span>
                                 <span className="font-bold text-xl bg-white text-blue-700 px-3 py-1 rounded-md shadow">₱ {down.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                        {/* Sticky header with navigation buttons */}
                        <div className='flex justify-end gap-2 sticky top-0 z-10 bg-white pb-2'>
                          <Button variant="outline" className="hover:bg-blue-100 transition-all">
                            Previous
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 transition-all"
                            onClick={() => {
                              if (selectedRooms.length === 0) {
                                toast.error("Please select at least one room.");
                                return;
                              }

                              // Run validation
                              if (!validateForm()) {
                                toast.error("Please fill in all required fields correctly.");
                                return;
                              }

                              const subtotal = selectedRooms.reduce(
                                (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                                0
                              );
                              const vat = subtotal - (subtotal / 1.12);
                              const total = subtotal;
                              const downpayment = total * 0.5;
                              handleGetSummaryInfo({
                                rooms: selectedRooms.map(room => ({
                                  ...room,
                                  guestCount:
                                    (adultCounts[room.unique_id || room.room_type] || 0) +
                                    (childrenCounts[room.unique_id || room.room_type] || 0),
                                  adultCount: adultCounts[room.unique_id || room.room_type] || 0,
                                  childrenCount: childrenCounts[room.unique_id || room.room_type] || 0,
                                })),
                                checkIn,
                                checkOut,
                                numberOfNights,
                                vat,
                                total,
                                downpayment,
                                customer: {
                                  firstName: walkinfirstname,
                                  lastName: walkinlastname,
                                  email: email,
                                  contactNumber: contactNumber
                                }
                              });

                              // ✅ open modal only if valid
                              setShowConfirmModal(true);
                            }}
                          >
                            Next
                          </Button>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>




  )

}

export default BookingNoaccount