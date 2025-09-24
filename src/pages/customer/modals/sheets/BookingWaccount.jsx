import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BedDouble, Info, MinusIcon, Plus, Trash2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import ConfirmBooking from '../ConfirmBooking'
import Moreinfo from './Moreinfo'

function BookingWaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {


  // ---------------------- Utilities (YMD, timezone-safe) ----------------------
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYMD = (s) => {
    if (!s) return null;
    const [y, m, day] = s.split('-').map(Number);
    if (!y || !m || !day) return null;
    const d = new Date(y, m - 1, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const getStoredYMDDate = (key, fallbackDaysAhead = 1) => {
    const val = localStorage.getItem(key);
    if (val) {
      const parsed = parseYMD(val);
      if (parsed) return parsed;
    }
    const d = new Date();
    d.setDate(d.getDate() + fallbackDaysAhead);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // ---------------------- Initial values (if you haven't set them earlier) ----------------------
  // (If you already have initialCheckIn/initialCheckOut logic, you can skip these)
  const initialCheckIn = getStoredYMDDate('checkIn', 1); // default tomorrow
  const initialCheckOutCandidate = getStoredYMDDate('checkOut', 2);
  const _minOut = new Date(initialCheckIn); _minOut.setDate(_minOut.getDate() + 1); _minOut.setHours(0, 0, 0, 0);
  const initialCheckOut = (initialCheckOutCandidate && initialCheckOutCandidate.getTime() > _minOut.getTime())
    ? initialCheckOutCandidate
    : _minOut;

  // ---------------------- Effects ----------------------
  const [allRooms, setAllRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [numberOfNights, setNumberOfNights] = useState(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [guestCounts, setGuestCounts] = useState({});
  const [adultCounts, setAdultCounts] = useState({});
  const [childrenCounts, setChildrenCounts] = useState({});
  const navigateTo = useNavigate();

  // recalc nights whenever dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn); inDate.setHours(0, 0, 0, 0);
      const outDate = new Date(checkOut); outDate.setHours(0, 0, 0, 0);
      const diff = outDate.getTime() - inDate.getTime();
      const days = Math.max(1, diff / (1000 * 60 * 60 * 24));
      setNumberOfNights(days);
    }
  }, [checkIn, checkOut]);



  // When the sheet opens, sync localStorage -> state and add selectedRoom only once
  useEffect(() => {
    if (!open) return;

    // read stored YMD strings (falling back to current state)
    const checkInStr = localStorage.getItem('checkIn') || formatYMD(checkIn || initialCheckIn);
    const checkOutStr = localStorage.getItem('checkOut') || formatYMD(checkOut || initialCheckOut);

    const checkInDate = parseYMD(checkInStr) || initialCheckIn;
    const checkOutDate = parseYMD(checkOutStr) || initialCheckOut;

    // ensure checkOut >= checkIn + 1
    const minOut = new Date(checkInDate); minOut.setDate(minOut.getDate() + 1); minOut.setHours(0, 0, 0, 0);
    const finalOut = checkOutDate.getTime() <= minOut.getTime() ? minOut : checkOutDate;

    setCheckIn(checkInDate);
    setCheckOut(finalOut);
    setAllRooms(rooms);

    // If a selectedRoom was passed in, add it once and init counts for it
    if (selectedRoom) {
      setSelectedRooms(prev => {
        const already = prev.some(r => r.room_type === selectedRoom.roomtype_id);
        if (already) return prev;

        const selected = {
          roomtype_name: selectedRoom.roomtype_name,
          roomtype_price: selectedRoom.roomtype_price,
          room_type: selectedRoom.roomtype_id,
          roomtype_description: selectedRoom.roomtype_description,
          roomtype_capacity: selectedRoom.roomtype_capacity,
        };

        const guestNum = parseInt(localStorage.getItem('guestNumber')) || initialGuestNumber || 1;
        const storedAdult = parseInt(localStorage.getItem('adult')) || adultNumber || 1;
        const storedChildren = parseInt(localStorage.getItem('children')) || childrenNumber || 0;
        const roomTypeId = selected.room_type;

        setGuestCounts(g => ({ ...g, [roomTypeId]: Math.min(guestNum, selected.roomtype_capacity || 1) }));
        setAdultCounts(a => ({ ...a, [roomTypeId]: Math.min(storedAdult, selected.roomtype_capacity || Number.MAX_SAFE_INTEGER) }));
        setChildrenCounts(c => ({ ...c, [roomTypeId]: Math.min(storedChildren, selected.roomtype_capacity || Number.MAX_SAFE_INTEGER) }));

        return [...prev, selected];
      });
    }

    // only run when sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Ensure newly added selectedRooms have initialized counts (safe: only sets when undefined)
  useEffect(() => {
    selectedRooms.forEach(room => {
      const roomTypeId = room.room_type;

      if (guestCounts[roomTypeId] === undefined) {
        setGuestCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(parseInt(localStorage.getItem('guestNumber')) || 1, room.roomtype_capacity || 1)
        }));
      }

      if (adultCounts[roomTypeId] === undefined) {
        setAdultCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(Math.max(0, parseInt(localStorage.getItem('adult')) || 1), room.roomtype_capacity || Number.MAX_SAFE_INTEGER)
        }));
      }

      if (childrenCounts[roomTypeId] === undefined) {
        const storedChildren = parseInt(localStorage.getItem('children')) || 0;
        const currAdults = adultCounts[roomTypeId] || 0;
        const remaining = Math.max(0, (room.roomtype_capacity || Number.MAX_SAFE_INTEGER) - currAdults);
        setChildrenCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(storedChildren, remaining)
        }));
      }
    });
    // intentionally depend only on selectedRooms (and counts as read) to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRooms]);

  // ---------------------- Handlers ----------------------

  const handleCheckInChange = (e) => {
    const newDateStr = e.target.value;
    const newDate = parseYMD(newDateStr);
    if (!newDate) return;
    setCheckIn(newDate);
    localStorage.setItem('checkIn', newDateStr);

    // ensure checkOut is at least next day
    const minOut = new Date(newDate); minOut.setDate(minOut.getDate() + 1); minOut.setHours(0, 0, 0, 0);
    if (!checkOut || new Date(checkOut).getTime() <= newDate.getTime()) {
      setCheckOut(minOut);
      localStorage.setItem('checkOut', formatYMD(minOut));
    } else {
      const currOut = new Date(checkOut);
      if (currOut.getTime() <= newDate.getTime()) {
        setCheckOut(minOut);
        localStorage.setItem('checkOut', formatYMD(minOut));
      }
    }
  };

  const handleCheckOutChange = (e) => {
    const newDateStr = e.target.value;
    const newDate = parseYMD(newDateStr);
    if (!newDate) return;
    const minOut = new Date(checkIn); minOut.setDate(minOut.getDate() + 1); minOut.setHours(0, 0, 0, 0);
    if (newDate.getTime() < minOut.getTime()) {
      toast.error("Check-out must be at least one day after check-in");
      return;
    }
    setCheckOut(newDate);
    localStorage.setItem('checkOut', newDateStr);
  };

  const handleRemoveRoom = (indexRemove) => {
    const roomToRemove = selectedRooms[indexRemove];
    const updated = selectedRooms.filter((_, i) => i !== indexRemove);
    setSelectedRooms(updated);

    if (roomToRemove) {
      setAdultCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
      setChildrenCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
      setGuestCounts(prev => { const copy = { ...prev }; delete copy[roomToRemove.room_type]; return copy; });
    }

    if (updated.length === 0) {
      setNumberOfNights(1);
      toast.info("Room selection cleared!");
    } else {
      toast.info("Room removed.");
    }
  };

  const openConfirmModal = () => setShowConfirmModal(true);
  const closeConfirmModal = () => setShowConfirmModal(false);

  // ---------------------- Booking submit ----------------------
  const customerBookingWithAccount = async () => {
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(checkIn).getTime() <= today.getTime()) {
        toast.error("Check-in date cannot be today or earlier.");
        return;
      }

      const url = localStorage.getItem('url') + "customer.php";
      const customerId = localStorage.getItem("userId");
      const childrenNumberLS = localStorage.getItem("children") || 0;
      const adultNumberLS = localStorage.getItem("adult") || 1;

      const subtotal = selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0);
      const displayedVat = subtotal - (subtotal / 1.12);
      const totalAmount = subtotal.toFixed(2);
      const downPayment = (subtotal * 0.5).toFixed(2);

      const bookingDetails = {
        checkIn: formatYMD(checkIn),
        checkOut: formatYMD(checkOut),
        downpayment: downPayment,
        totalAmount: totalAmount,
        displayedVat: displayedVat.toFixed(2),
        children: childrenNumberLS,
        adult: adultNumberLS
      };

      const roomDetails = selectedRooms.map((room) => {
        const adultCount = adultCounts[room.room_type] || 0;
        const childrenCount = childrenCounts[room.room_type] || 0;
        return {
          roomTypeId: room.room_type,
          guestCount: adultCount + childrenCount,
          adultCount: adultCount,
          childrenCount: childrenCount,
        };
      });

      const jsonData = { customerId, bookingDetails, roomDetails };
      const formData = new FormData();
      formData.append("operation", "customerBookingWithAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);

      if (res.data === -1) {
        toast.error("The room is not available anymore");
      } else if (res.data === 1) {
        toast.success("Booking successful");
        setOpen(false);
        localStorage.removeItem('checkIn');
        localStorage.removeItem('checkOut');
        setSelectedRooms([]);
        setAdultCounts({});
        setChildrenCounts({});
        setGuestCounts({});
        handleClearData();
        localStorage.setItem('refreshBookings', Date.now().toString());
      } else {
        toast.error("Booking error");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  // ---------------------- Small helper for input min attr ----------------------
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
  const tomorrowStr = formatYMD(tomorrow);


  return (
    <>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button >Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[97vh] overflow-y-auto rounded-t-3xl ">
          <div>
            {/* ✅ Date pickers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              <div className="flex flex-col gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                <div className="text-xs text-gray-500">Check-in</div>
                <input
                  type="date"
                  className="w-full rounded-md border px-2 py-1"
                  value={formatYMD(checkIn)}
                  min={tomorrowStr}
                  onChange={(e) => {
                    const ymd = e.target.value;
                    const newDate = parseYMD(ymd);
                    if (!newDate) return;
                    setCheckIn(newDate);
                    localStorage.setItem('checkIn', ymd); // store YMD

                    // ensure checkOut >= next day
                    const nextDay = new Date(newDate);
                    nextDay.setDate(newDate.getDate() + 1);
                    nextDay.setHours(0, 0, 0, 0);
                    if (checkOut.getTime() <= newDate.getTime()) {
                      setCheckOut(nextDay);
                      localStorage.setItem('checkOut', formatYMD(nextDay)); // store YMD
                    }
                  }}
                />
              </div>

              {/* ✅ CHECK-OUT */}
              <div className="flex flex-col gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                <div className="text-xs text-gray-500">Check-out</div>
                <input
                  type="date"
                  className="w-full rounded-md border px-2 py-1"
                  value={formatYMD(checkOut)}
                  min={formatYMD(new Date(checkIn.getTime() + 86400000))}
                  onChange={(e) => {
                    const ymd = e.target.value;
                    const newDate = parseYMD(ymd);
                    if (!newDate) return;
                    setCheckOut(newDate);
                    localStorage.setItem('checkOut', ymd); // store YMD
                  }}
                />
              </div>
            </div>

            {/* ✅ MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-t-2xl bg-gray-100 ">
              <div className="space-y-8 md:sticky md:top-4">
                <Card className="bg-white shadow-xl text-black w-full">
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Selected Rooms: {selectedRooms.length}
                        </div>
                        <div>
                          <RoomsList
                            rooms={allRooms}
                            selectedRooms={selectedRooms}
                            setSelectedRooms={setSelectedRooms}
                          />
                        </div>
                      </div>
                    </div>
                    <Card className="bg-gray-100">
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div>
                          {selectedRooms.length > 0 ? (
                            <div>
                              {selectedRooms.map((room, index) => (
                                <Card key={index} className="mb-3 m-3">
                                  <CardContent>
                                    <div className="flex justify-end">
                                      <Trash2
                                        className="cursor-pointer text-red-500"
                                        onClick={() => handleRemoveRoom(index)}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                      <div>
                                        <h1 className="font-semibold text-2xl font-playfair text-[#113F67]">
                                          {room.roomtype_name}
                                        </h1>
                                        <h1>{room.roomtype_description}</h1>
                                        <Link>
                                          <div className="flex flex-row space-x-2 mt-2 mb-2">
                                            <div>
                                              <Moreinfo room={room} />
                                            </div>
                                            <div>
                                              <Info />
                                            </div>
                                          </div>
                                        </Link>
                                        <h1 className="flex items-center gap-2 font-semibold text-[#113F67]">
                                          <BedDouble size={20} />
                                          ₱{" "}
                                          {Number(room.roomtype_price).toLocaleString(
                                            "en-PH",
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            }
                                          )}
                                          /day
                                        </h1>

                                        {/* ✅ Adult/Children selectors */}
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                          {/* Adults */}
                                          <div className="rounded-2xl border-none p-4">
                                            <div className="flex items-center ">
                                              <Label className="mb-2">Adults</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  const roomTypeId = room.room_type;
                                                  const current =
                                                    adultCounts[roomTypeId] || 0;
                                                  setAdultCounts((prev) => ({
                                                    ...prev,
                                                    [roomTypeId]: Math.max(
                                                      0,
                                                      current - 1
                                                    ),
                                                  }));
                                                }}
                                                disabled={
                                                  (adultCounts[room.room_type] || 0) <= 1
                                                }
                                              >
                                                <MinusIcon />
                                              </Button>
                                              {adultCounts[room.room_type] || 0}
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  const roomTypeId = room.room_type;
                                                  const current =
                                                    adultCounts[roomTypeId] || 0;
                                                  const currentChildren =
                                                    childrenCounts[roomTypeId] || 0;
                                                  if (
                                                    current + currentChildren <
                                                    (room.roomtype_capacity ||
                                                      Number.MAX_SAFE_INTEGER)
                                                  ) {
                                                    setAdultCounts((prev) => ({
                                                      ...prev,
                                                      [roomTypeId]: current + 1,
                                                    }));
                                                  }
                                                }}
                                                disabled={
                                                  (adultCounts[room.room_type] || 0) +
                                                  (childrenCounts[room.room_type] || 0) >=
                                                  (room.roomtype_capacity ||
                                                    Number.MAX_SAFE_INTEGER)
                                                }
                                              >
                                                <Plus />
                                              </Button>
                                            </div>
                                          </div>

                                          {/* Children */}
                                          <div className="rounded-2xl border-none p-4">
                                            <div className="flex items-center">
                                              <Label className="mb-2">Children</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  const roomTypeId = room.room_type;
                                                  const current =
                                                    childrenCounts[roomTypeId] || 0;
                                                  setChildrenCounts((prev) => ({
                                                    ...prev,
                                                    [roomTypeId]: Math.max(
                                                      0,
                                                      current - 1
                                                    ),
                                                  }));
                                                }}
                                                disabled={
                                                  (childrenCounts[room.room_type] || 0) <= 0
                                                }
                                              >
                                                <MinusIcon />
                                              </Button>
                                              {childrenCounts[room.room_type] || 0}
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  const roomTypeId = room.room_type;
                                                  const current =
                                                    childrenCounts[roomTypeId] || 0;
                                                  const currentAdults =
                                                    adultCounts[roomTypeId] || 0;
                                                  if (
                                                    currentAdults + current <
                                                    (room.roomtype_capacity ||
                                                      Number.MAX_SAFE_INTEGER)
                                                  ) {
                                                    setChildrenCounts((prev) => ({
                                                      ...prev,
                                                      [roomTypeId]: current + 1,
                                                    }));
                                                  }
                                                }}
                                                disabled={
                                                  (adultCounts[room.room_type] || 0) +
                                                  (childrenCounts[room.room_type] || 0) >=
                                                  (room.roomtype_capacity ||
                                                    Number.MAX_SAFE_INTEGER)
                                                }
                                              >
                                                <Plus />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="mt-3 text-sm text-gray-700">
                                          Total guests:{" "}
                                          <span className="font-semibold">
                                            {(adultCounts[room.room_type] || 0) +
                                              (childrenCounts[room.room_type] || 0)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
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
              </div>

              {/* ✅ Right column summary */}
              <div className="space-y-8 md:sticky md:top-4 h-fit ">
                <Card className="bg-white shadow-md rounded-2xl ">
                  <CardContent className="space-y-3 text-black">
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold text-lg">Booking Summary</h1>
                      <div className="text-sm text-[#113F67] font-medium">
                        {selectedRooms.length} Room
                        {selectedRooms.length !== 1 ? "s" : ""} Selected
                      </div>
                    </div>
                    <Card className="bg-gray-50 border rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2">
                        <ScrollArea className="h-52 ">
                          {selectedRooms.length > 0 &&
                            selectedRooms.map((room, index) => (
                              <Card key={index} className="mb-3 shadow-md rounded-sm">
                                <CardContent>
                                  <CardTitle>Room {index + 1}</CardTitle>
                                  <div className="flex flex-row justify-between items-center  py-2">
                                    <h2 className="font-medium text-lg">{room.roomtype_name}</h2>
                                    <p className="font-semibold text-xl">
                                      {`${numberOfNights} Day(s) x ₱${room.roomtype_price.toLocaleString(
                                        "en-PH",
                                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                      )}`}
                                    </p>
                                  </div>
                                  <p className="text-md font-semibold text-right text-[#113F67]">
                                    = ₱
                                    {(numberOfNights * room.roomtype_price).toLocaleString(
                                      "en-PH",
                                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                    )}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                        </ScrollArea>
                      </div>
                    </Card>
                    {(() => {
                      const subtotal = selectedRooms.reduce(
                        (t, r) => t + Number(r.roomtype_price) * numberOfNights,
                        0
                      );
                      const vat = subtotal - subtotal / 1.12;
                      const total = subtotal;
                      const down = total * 0.5;
                      return (
                        <>
                          <div className="flex justify-between items-center py-2 ">
                            <span className="font-medium">VAT (12%) included:</span>
                            <span>
                              ₱{" "}
                              {vat.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold">Total (VAT included):</span>
                            <span className="font-semibold text-2xl">
                              ₱{" "}
                              {total.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold">Down Payment (50%):</span>
                            <span className="font-semibold text-2xl text-blue-600">
                              ₱{" "}
                              {down.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Button
                  onClick={() => {
                    // Make sure you define today first
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // normalize to midnight

                    // Also normalize the checkIn date to midnight
                    const normalizedCheckIn = new Date(checkIn);
                    normalizedCheckIn.setHours(0, 0, 0, 0);

                    if (normalizedCheckIn.getTime() <= today.getTime()) {
                      toast.error("Check-in date cannot be today or earlier.");
                      return;
                    }

                    if (selectedRooms.length === 0) return;

                    const subtotal = selectedRooms.reduce(
                      (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                      0
                    );
                    const vat = subtotal - subtotal / 1.12;
                    const total = subtotal;
                    const downpayment = total * 0.5;

                    setSummaryInfo({
                      rooms: selectedRooms.map((room) => ({
                        ...room,
                        guestCount:
                          (adultCounts[room.room_type] || 0) +
                          (childrenCounts[room.room_type] || 0),
                        adultCount: adultCounts[room.room_type] || 0,
                        childrenCount: childrenCounts[room.room_type] || 0,
                      })),
                      checkIn,
                      checkOut,
                      numberOfNights,
                      vat,
                      total,
                      downpayment,
                    });

                    setShowConfirmModal(true);
                  }}
                >
                  Confirm Booking
                </Button>

                {showConfirmModal && (
                  <ConfirmBooking
                    open={showConfirmModal}
                    onClose={closeConfirmModal}
                    handleClearData={handleClearData}
                    summary={summaryInfo}
                    onConfirmBooking={customerBookingWithAccount}
                  />
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );

}

export default BookingWaccount