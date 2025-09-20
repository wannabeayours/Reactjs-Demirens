import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { BedDouble, BedIcon, Info, MinusIcon, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import ConfirmBooking from '../ConfirmBooking'
import Moreinfo from './Moreinfo'

function BookingWaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {
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

  const navigateTo = useNavigate();







  const customerBookingWithAccount = async () => {
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
        customerId: customerId,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }
      console.log("jsondata", jsonData)
      const formData = new FormData();
      formData.append("operation", "customerBookingWithAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("noOOo", res);
      if (res.data === -1) {
        toast.error("The room is not available anymore");
      }
      else if (res.data === 1) {
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
    if (open) {
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
        roomtype_capacity: selectedRoom.roomtype_capacity,
      };

      // Check if room is already selected to avoid duplicates
      setSelectedRooms(prev => {
        const isAlreadySelected = prev.some(room => room.room_type === selected.room_type);
        if (isAlreadySelected) {
          return prev; // Don't add duplicate
        }
        
        // Add new room and initialize its counts
        const newRooms = [...prev, selected];
        
        // Initialize counts for this specific room only
        const roomTypeId = selected.room_type;
        
        // Set guest count for this room
        const validGuestNum = Math.min(guestNum || 1, selected.roomtype_capacity || 1);
        setGuestCounts(prevCounts => ({
          ...prevCounts,
          [roomTypeId]: validGuestNum
        }));
        
        // Set adult count for this room only
        const initAdults = adultNumber || parseInt(storedAdult) || 1;
        setAdultCounts(prevCounts => ({
          ...prevCounts,
          [roomTypeId]: initAdults
        }));
        
        // Set children count for this room only
        const initChildren = childrenNumber || parseInt(storedChildren) || 0;
        setChildrenCounts(prevCounts => ({
          ...prevCounts,
          [roomTypeId]: initChildren
        }));
        
        return newRooms;
      });
    }
  }, [adultNumber, childrenNumber, open, rooms, selectedRoom]);


  // This effect only initializes counts for newly added rooms
  useEffect(() => {
    // For each room in selectedRooms, ensure it has counts initialized
    selectedRooms.forEach(room => {
      const roomTypeId = room.room_type;
      
      // Only initialize if this room doesn't have counts yet
      if (guestCounts[roomTypeId] === undefined) {
        // Initialize guest count
        setGuestCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(
            parseInt(localStorage.getItem('guestNumber')) || 1,
            room.roomtype_capacity || 1
          )
        }));
      }
      
      // Only initialize adult count if not already set
      if (adultCounts[roomTypeId] === undefined) {
        setAdultCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(
            Math.max(0, parseInt(localStorage.getItem('adult')) || 1),
            room.roomtype_capacity || Number.MAX_SAFE_INTEGER
          )
        }));
      }
      
      // Only initialize children count if not already set
      if (childrenCounts[roomTypeId] === undefined) {
        const storedChildren = parseInt(localStorage.getItem('children')) || 0;
        const currentAdults = adultCounts[roomTypeId] || 0;
        const remainingCapacity = Math.max(0, (room.roomtype_capacity || Number.MAX_SAFE_INTEGER) - currentAdults);
        
        setChildrenCounts(prev => ({
          ...prev,
          [roomTypeId]: Math.min(storedChildren, remainingCapacity)
        }));
      }
    });
  }, [selectedRooms, guestCounts, adultCounts, childrenCounts]);

  // // Keep localStorage in sync when adults change
  // useEffect(() => {
  //   const totalAdults = Object.values(adultCounts).reduce((sum, count) => sum + count, 0);
  //   localStorage.setItem('adult', String(totalAdults));
  //   const totalChildren = Object.values(childrenCounts).reduce((sum, count) => sum + count, 0);
  //   localStorage.setItem('guestNumber', String(totalAdults + totalChildren));
  // }, [adultCounts]);

  // // Keep localStorage in sync when children change
  // useEffect(() => {
  //   const totalChildren = Object.values(childrenCounts).reduce((sum, count) => sum + count, 0);
  //   localStorage.setItem('children', String(totalChildren));
  //   const totalAdults = Object.values(adultCounts).reduce((sum, count) => sum + count, 0);
  //   localStorage.setItem('guestNumber', String(totalAdults + totalChildren));
  // }, [childrenCounts]);




  const handleRemoveRoom = (indexRemove) => {
    const roomToRemove = selectedRooms[indexRemove];
    const updatedRooms = selectedRooms.filter((_, index) => index !== indexRemove);
    setSelectedRooms(updatedRooms);

    // Clean up guest counts for removed room
    if (roomToRemove) {
      setAdultCounts(prev => {
        const updated = { ...prev };
        delete updated[roomToRemove.room_type];
        return updated;
      });
      setChildrenCounts(prev => {
        const updated = { ...prev };
        delete updated[roomToRemove.room_type];
        return updated;
      });
      // setExtraBedCounts(prev => {
      //   const updated = { ...prev };
      //   delete updated[roomToRemove.room_type];
      //   return updated;
      // });
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

  return (
    <>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button >Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[97vh] overflow-y-auto rounded-t-3xl ">
          <div  >
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                <div className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                  <div className="text-xs text-gray-500">Check-in</div>
                  <div className="ml-auto text-sm font-medium">
                    {checkIn.toLocaleString(undefined, { dateStyle: 'medium' })}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                  <div className="text-xs text-gray-500">Check-out</div>
                  <div className="ml-auto text-sm font-medium">
                    {checkOut.toLocaleString(undefined, { dateStyle: 'medium' })}
                  </div>
                </div>

              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-t-2xl bg-gray-100 ">
              <div className="space-y-8 md:sticky md:top-4  ">
                <Card className="bg-white shadow-xl text-black w-full">
                  <CardContent>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4  p-4 ">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Selected Rooms: {selectedRooms.length}
                        </div>
                        <div>
                          <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
                        </div>
                      </div>

                    </div>
                    <Card className="bg-gray-100">
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div >
                          {selectedRooms.length > 0 ? (
                            <div >
                              {selectedRooms.map((room, index) => (
                                <Card key={index} className="mb-3 m-3">
                                  <CardContent>
                                    <div className="flex justify-end">
                                      <Trash2 className="cursor-pointer text-red-500"
                                        onClick={() => handleRemoveRoom(index)}
                                      />

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
                                      <div>
                                        <h1 className="font-semibold text-2xl font-playfair text-[#113F67]">{room.roomtype_name}</h1>
                                        <h1>{room.roomtype_description}</h1>
                                        <Link >
                                          <div className="flex flex-row space-x-2 mt-2 mb-2 ">
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
                                          ₱ {Number(room.roomtype_price).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}/day
                                        </h1>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
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
                                                  // Get the current count for THIS specific room only
                                                  const roomTypeId = room.room_type;
                                                  const current = adultCounts[roomTypeId] || 0;
                                                  
                                                  // Update only THIS room's count
                                                  setAdultCounts(prev => ({
                                                    ...prev,
                                                    [roomTypeId]: Math.max(0, current - 1)
                                                  }));
                                                }}
                                                disabled={(adultCounts[room.room_type] || 0) <= 1}
                                              >
                                                <MinusIcon />
                                              </Button>
                                              {adultCounts[room.room_type] || 0}
                                              {/* <Input
                                                className="w-24 text-center"
                                                type="number"
                                                min={0}
                                                value={adultCounts[room.room_type] || 0}
                                                onChange={(e) => {
                                                  const next = Number(e.target.value);
                                                  const cap = room.roomtype_capacity || Number.MAX_SAFE_INTEGER;
                                                  const currentChildren = childrenCounts[room.room_type] || 0;
                                                  const allowed = Math.max(0, cap - currentChildren);
                                                  setAdultCounts(prev => ({
                                                    ...prev,
                                                    [room.room_type]: Number.isFinite(next) ? Math.min(allowed, Math.max(0, next)) : 0
                                                  }));
                                                }}
                                              /> */}
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  // Get the current counts for THIS specific room only
                                                  const roomTypeId = room.room_type;
                                                  const current = adultCounts[roomTypeId] || 0;
                                                  const currentChildren = childrenCounts[roomTypeId] || 0;
                                                  
                                                  // Check capacity for THIS room only
                                                  if ((current + currentChildren) < (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)) {
                                                    // Update only THIS room's count
                                                    setAdultCounts(prev => ({
                                                      ...prev,
                                                      [roomTypeId]: current + 1
                                                    }));
                                                  }
                                                }}
                                                disabled={((adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0)) >= (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)}
                                              >
                                                <Plus />
                                              </Button>
                                            </div>
                                            {/* <div className="mt-2 text-right text-xs text-gray-500">
                                          Remaining: {Math.max(0, (room.room_capacity || 0) - (adultNum + childrenNum))}
                                        </div> */}
                                          </div>

                                          <div className="rounded-2xl border-none p-4">
                                            <div className="flex items-center">
                                              <Label className="mb-2">Children</Label>
                                              {/* <span className="text-xs text-gray-500">Cap: {room.room_capacity || 0}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  // Get the current count for THIS specific room only
                                                  const roomTypeId = room.room_type;
                                                  const current = childrenCounts[roomTypeId] || 0;
                                                  
                                                  // Update only THIS room's count
                                                  setChildrenCounts(prev => ({
                                                    ...prev,
                                                    [roomTypeId]: Math.max(0, current - 1)
                                                  }));
                                                }}
                                                disabled={(childrenCounts[room.room_type] || 0) <= 0}
                                              >
                                                <MinusIcon />
                                              </Button>
                                              {childrenCounts[room.room_type] || 0}
                                              {/* <Input
                                                className="w-24 text-center"
                                                type="number"
                                                min={0}
                                                value={childrenCounts[room.room_type] || 0}
                                                onChange={(e) => {
                                                  const next = Number(e.target.value);
                                                  const cap = room.roomtype_capacity || Number.MAX_SAFE_INTEGER;
                                                  const currentAdults = adultCounts[room.room_type] || 0;
                                                  const allowed = Math.max(0, cap - currentAdults);
                                                  setChildrenCounts(prev => ({
                                                    ...prev,
                                                    [room.room_type]: Number.isFinite(next) ? Math.min(allowed, Math.max(0, next)) : 0
                                                  }));
                                                }}
                                              /> */}
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                  // Get the current counts for THIS specific room only
                                                  const roomTypeId = room.room_type;
                                                  const current = childrenCounts[roomTypeId] || 0;
                                                  const currentAdults = adultCounts[roomTypeId] || 0;
                                                  
                                                  // Check capacity for THIS room only
                                                  if ((currentAdults + current) < (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)) {
                                                    // Update only THIS room's count
                                                    setChildrenCounts(prev => ({
                                                      ...prev,
                                                      [roomTypeId]: current + 1
                                                    }));
                                                  }
                                                }}
                                                disabled={((adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0)) >= (room.roomtype_capacity || Number.MAX_SAFE_INTEGER)}
                                              >
                                                <Plus />
                                              </Button>
                                            </div>
                                            {/* <div className="mt-2 text-right text-xs text-gray-500">
                                          Remaining: {Math.max(0, (room.room_capacity || 0) - (adultNum + childrenNum))}
                                        </div> */}
                                          </div>
                                        </div>

                                        <div className="mt-3 text-sm text-gray-700">
                                          Total guests: <span className="font-semibold">{(adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0)}</span>
                                        </div>



                                      </div>

                                      {/* <div className="flex justify-center">
                                        <Carousel className="w-full max-w-[295px]">
                                          <CarouselContent>
                                            {Array.from({ length: 5 }).map((_, index) => (
                                              <CarouselItem key={index}>
                                                <div className="p-1">
                                                  <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-4">
                                                      <span className="text-2xl font-semibold">{index + 1}</span>
                                                    </CardContent>
                                                  </Card>
                                                </div>
                                              </CarouselItem>
                                            ))}
                                          </CarouselContent>
                                          <CarouselPrevious className="left-1" />
                                          <CarouselNext className="right-1" />
                                        </Carousel>
                                      </div> */}

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
              </div>


              <div className="space-y-8 md:sticky md:top-4 h-fit ">

                <Card className="bg-white shadow-md rounded-2xl ">
                  <CardContent className="space-y-3 text-black">

                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold text-lg">Booking Summary</h1>

                      <div className="text-sm text-[#113F67] font-medium">

                        {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''} Selected
                      </div>
                    </div>
                    <Card className="bg-gray-50 border rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2">
                        <ScrollArea className="h-52 ">
                          {selectedRooms.length > 0 && selectedRooms.map((room, index) => (
                            <Card key={index} className="mb-3 shadow-md rounded-sm">
                              <CardContent >
                                <CardTitle >Room {index + 1}</CardTitle>
                                <div className="flex flex-row justify-between items-center  py-2">
                                  <h2 className="font-medium text-lg">{room.roomtype_name}</h2>

                                  <p className="font-semibold text-xl">
                                    {`${numberOfNights} Day(s) x ₱${room.roomtype_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                  </p>
                                </div>
                                <p className="text-md font-semibold text-right text-[#113F67]">
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

                          <div className="flex justify-between items-center py-2 ">
                            <span className="font-medium">VAT (12%) included:</span>
                            <span>₱ {vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold">Total (VAT included):</span>
                            <span className="font-semibold text-2xl">₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold">Down Payment (50%):</span>
                            <span className="font-semibold text-2xl text-blue-600">₱ {down.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>

                </Card>
                {/* <Card className="bg-white shadow-2xl rounded-2xl">
                  <CardContent className="space-y-2 text-black">
                    <h2 className="font-semibold">Payment Method</h2>
                    <p className="text-sm text-muted-foreground">You will receive payment instructions after confirming your booking.</p>
                  </CardContent>

                </Card> */}
                {/* <Button
                  onClick={() => {
                    if (selectedRooms.length === 0) return;

                    const subtotal = selectedRooms.reduce(
                      (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                      0
                    );
                    const vat = subtotal - (subtotal / 1.12);
                    const total = subtotal;
                    const downpayment = total * 0.5;

                    setSummaryInfo({
                      rooms: selectedRooms.map(room => ({
                        ...room,
                        guestCount: (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0),
                        adultCount: adultCounts[room.room_type] || 0,
                        childrenCount: childrenCounts[room.room_type] || 0,
                        // extraBeds: extraBedCounts[room.room_type] || 0,
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
                </Button> */}
                <Button


                  onClick={() => {
                    if (selectedRooms.length === 0) return;

                    const subtotal = selectedRooms.reduce(
                      (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                      0
                    );
                    const vat = subtotal - (subtotal / 1.12);
                    const total = subtotal;
                    const downpayment = total * 0.5;

                    setSummaryInfo({
                      rooms: selectedRooms.map(room => ({
                        ...room,
                        guestCount: (adultCounts[room.room_type] || 0) + (childrenCounts[room.room_type] || 0),
                        adultCount: adultCounts[room.room_type] || 0,
                        childrenCount: childrenCounts[room.room_type] || 0,
                        // extraBeds: extraBedCounts[room.room_type] || 0,
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

                {showConfirmModal &&
                  <ConfirmBooking
                    open={openConfirmModal}
                    onClose={closeConfirmModal}
                    handleClearData={handleClearData}
                    // onOpenChange={setShowConfirmModal}
                    summary={summaryInfo}
                    onConfirmBooking={customerBookingWithAccount}
                  />
                }

                {showConfirmModal &&
                  <ConfirmBooking
                    open={openConfirmModal}
                    onClose={closeConfirmModal}
                    handleClearData={handleClearData}
                    // onOpenChange={setShowConfirmModal}
                    summary={summaryInfo}
                    onConfirmBooking={customerBookingWithAccount}
                  />
                }

              </div>

            </div>
          </div>



        </SheetContent>

      </Sheet>
    </>
  )

}

export default BookingWaccount