import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { BedDouble, BedIcon, Info, MinusIcon, Plus, Scroll, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link } from 'react-router-dom'
import ConfirmBooking from '../ConfirmBooking'
import Moreinfo from './Moreinfo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'

function BookingNoaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {
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

  const schema = z.object({
    walkinfirstname: z.string().min(1, { message: "First name is required" }),
    walkinlastname: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    contactNumber: z.string().min(1, { message: "Contact number is required" }),
  })

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      walkinfirstname: "",
      walkinlastname: "",
      email: "",
      contactNumber: "",

    },
  })



  const customerBookingNoAccount = async (values) => {
    console.log("values", values)
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
        walkinfirstname: values.walkinfirstname,
        walkinlastname: values.walkinlastname,
        email: values.email,
        contactNumber: values.contactNumber,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }

      console.log("jsondata", jsonData)
      const formData = new FormData();
      formData.append("operation", "customerBookingNoAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("noOOo", res);
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

    }
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
      // setExtraBedCounts(prev => {
      //   const updated = { ...prev };
      //   delete updated[roomKey];
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

  useEffect(() => {
    console.log("rooms", selectedRooms);
  }, [selectedRooms])

  return (
    <>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button >Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="text-black p-6 border-none rounded-t-3xl bg-white">
          <div className="h-[100vh] md:h-[calc(100vh-100px)] md:overflow-y-hidden overflow-y-auto" >


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
                {/* <div className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                  <span className="text-xs text-gray-500">Adults</span>
                  <div className="ml-auto text-sm font-semibold">{adultNum}</div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                  <span className="text-xs text-gray-500">Children</span>
                  <div className="ml-auto text-sm font-semibold">{childrenNum}</div>
                </div> */}
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 h-[calc(100vh-180px)]">
              {/* LEFT SIDE: Selected Rooms (scrollable) */}


              <Card className="bg-white shadow-xl text-black w-[97%]">
                <CardContent>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
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
                                  <div className="grid grid-cols-1 gap-4 ">
                                    <div>
                                      <h1 className="font-semibold text-2xl font-playfair text-blue-500">{room.roomtype_name}</h1>
                                      <h1>{room.roomtype_description}</h1>
                                      <Link >
                                        <div className="flex flex-row space-x-2 mt-4 mb-2 ">
                                          <div>
                                            <Moreinfo room={room} />
                                          </div>
                                          <div>
                                            <Info />
                                          </div>

                                        </div>
                                      </Link>
                                      <h1 className="flex items-center gap-2 font-semibold text-blue-500">
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
                                            {/* <span className="text-xs text-gray-500">Cap: {room.room_capacity || 0}</span> */}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="rounded-full"
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
                                              <MinusIcon />
                                            </Button>
                                            {adultCounts[room.unique_id || room.room_type] || 0}
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
                                                const roomKey = room.unique_id || room.room_type;
                                                const current = childrenCounts[roomKey] || 0;
                                                setChildrenCounts(prev => ({
                                                  ...prev,
                                                  [roomKey]: Math.max(0, current - 1)
                                                }));
                                              }}
                                              disabled={(childrenCounts[room.unique_id || room.room_type] || 0) <= 0}
                                            >
                                              <MinusIcon />
                                            </Button>
                                            {childrenCounts[room.unique_id || room.room_type] || 0}
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="rounded-full"
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
                                              <Plus />
                                            </Button>
                                          </div>
                                          {/* <div className="mt-2 text-right text-xs text-gray-500">
                                          Remaining: {Math.max(0, (room.room_capacity || 0) - (adultNum + childrenNum))}
                                        </div> */}
                                        </div>
                                      </div>

                                      <div className="mt-3 text-sm text-gray-700">
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


              <ScrollArea className="h-[calc(80vh)]">
                <div className="flex flex-col border-none bg-transparent pr-2 mb-6 space-y-3 ">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(customerBookingNoAccount)}>
                      <Card className="bg-white shadow-md">
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                            <div>
                              <FormField
                                control={form.control}
                                name="walkinfirstname"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter your first name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormField
                                control={form.control}
                                name="walkinlastname"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter your last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter your contact number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {showConfirmModal &&
                              <ConfirmBooking
                                open={showConfirmModal}
                                onClose={closeConfirmModal}
                                handleClearData={handleClearData}
                                summary={summaryInfo}
                                onConfirmBooking={form.handleSubmit(customerBookingNoAccount)}
                              />
                            }
                          </div>
                        </CardContent>

                      </Card>
                    </form>
                  </Form>
                  <Card className="bg-white shadow-md rounded-2xl ">
                    <CardContent className="space-y-3 text-black">

                      <div className="flex justify-between items-center">
                        <h1 className="font-semibold text-lg">Booking Summary</h1>

                        <div className="text-sm text-blue-600 font-medium">

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

                  <Card className="bg-white shadow-md rounded-2xl">
                    <CardContent className="space-y-2 text-black">
                      <h2 className="font-semibold">Payment Method</h2>
                      <p className="text-sm text-muted-foreground">You will receive payment instructions after confirming your booking.</p>
                    </CardContent>

                  </Card>


                </div>
                <Button
                  onClick={async () => {
                    if (selectedRooms.length === 0) return;

                    // ✅ run validation first
                    const isValid = await form.trigger();
                    if (!isValid) {
                      toast.error("Please fill in all required fields correctly.");
                      return; // ❌ don't open modal
                    }

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
                    });

                    // ✅ open modal only if valid
                    setShowConfirmModal(true);
                  }}
                >
                  Confirm Booking
                </Button>

              </ScrollArea>

            </div>
          </div>



        </SheetContent>

      </Sheet >
    </>
  )

}

export default BookingNoaccount