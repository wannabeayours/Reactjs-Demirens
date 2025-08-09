import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'

import { Bed, BedIcon, Info, MinusIcon, Plus, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form"
import ConfirmBooking from '../ConfirmBooking'
import Moreinfo from './Moreinfo'

const schema = z.object({
  walkinfirstname: z.string().min(1, { message: "First name is required" }),
  walkinlastname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  contactNumber: z.string().min(1, { message: "Contact number is required" }),
})

function BookingNoAccount({ rooms, selectedRoom, guests, adultNumber, childrenNumber }) {
  const [walkinfirstname, setWalkinfirstname] = useState('');
  const [walkinlastname, setWalkinlastname] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [numberOfNights, setNumberOfNights] = useState(1);
  const [open, setOpen] = useState(false)
  const [guestNumber, setGuestNumber] = useState(0);
  const [allRooms, setAllRooms] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [extraBedCounts, setExtraBedCounts] = useState({});
  const [guestCounts, setGuestCounts] = useState({});
  const [adultCounts, setAdultCounts] = useState({});
  const [childrenCounts, setChildrenCounts] = useState({});

  const onSubmit = async (data) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const downPayment = (selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0) * 1.12 * 0.5).toFixed(2);
      const totalAmount = (selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0) * 1.12).toFixed(2);
      const children = localStorage.getItem("children");
      const adult = localStorage.getItem("adult");
      const totalPayment = (selectedRoom)
      const room = selectedRooms;
      console.log("rooms", selectedRooms);
      const bookingDetails = {
        downpayment: downPayment,
        checkIn: checkIn,
        checkOut: checkOut,
        totalAmount: totalAmount,
        children: children,
        
      }
      // Get current guest counts from localStorage
      const currentAdults = parseInt(localStorage.getItem('adultNumber')) || adultNumber || 1;
      const currentChildren = parseInt(localStorage.getItem('childrenNumber')) || childrenNumber || 0;
      const totalGuests = currentAdults + currentChildren;

      const jsonData = {
        customers_walk_in_fname: data.walkinfirstname,
        customers_walk_in_lname: data.walkinlastname,
        customers_walk_in_email: data.email,
        customers_walk_in_phone_number: data.contactNumber,
        booking_checkin_dateandtime: checkIn.toISOString(),
        booking_checkout_dateandtime: checkOut.toISOString(),
        booking_downpayment: downPayment,
        roomtype_id: room.room_type,
        room_count: 1,
        guest_number: totalGuests,
        adult_number: currentAdults,
        children_number: currentChildren,
      };

      console.log('Submitting booking data:', jsonData);

      const formData = new FormData();
      formData.append("operation", "customerBookingNoAccount");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);

      console.log('API response:', res.data);

      if (res.data === 1) {
        toast.success("Booking successful! Check your email.");
        setOpen(false);
        setShowConfirmModal(false);
        localStorage.removeItem('checkIn');
        localStorage.removeItem('checkOut');
        localStorage.removeItem('adultNumber');
        localStorage.removeItem('childrenNumber');
        setSelectedRooms([]);
      } else {
        toast.error("Booking failed. Please try again.");
      }

    } catch (error) {
      console.error('Booking error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(`Booking failed: ${error.response.data || 'Server error'}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }
  useEffect(() => {
    if (open) {
      const checkInStr = localStorage.getItem('checkIn')
      const checkOutStr = localStorage.getItem('checkOut')

      // Use props if available, otherwise fallback to localStorage
      const totalGuests = (adultNumber || 1) + (childrenNumber || 0);
      const guestNum = Math.min(totalGuests, selectedRoom.max_capacity || 1);

      const checkInDate = new Date(checkInStr)
      const checkOutDate = new Date(checkOutStr)
      setCheckIn(checkInDate)
      setCheckOut(checkOutDate)

      // Calculate number of gabii
      const diffTime = checkOutDate.getTime() - checkInDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // convert ms to days

      setNumberOfNights(diffDays)

      setAllRooms(rooms)
      setSelectedRooms([{
        roomtype_name: selectedRoom.roomtype_name,
        roomtype_price: selectedRoom.roomtype_price,
        roomtype_id: selectedRoom.room_type,
        roomtype_description: selectedRoom.roomtype_description,
        max_capacity: selectedRoom.max_capacity
      }])

      // Set initial guest counts based on props
      const totalRequested = (adultNumber || 1) + (childrenNumber || 0);
      const maxCapacity = selectedRoom.max_capacity || 1;

      // Debug logging
      console.log('BookingNoAccount Debug:', {
        adultNumber,
        childrenNumber,
        totalRequested,
        maxCapacity,
        selectedRoom
      });

      // If total requested fits within capacity, use the exact values
      if (totalRequested <= maxCapacity) {
        const initialAdultCount = adultNumber || 1;
        const initialChildrenCount = childrenNumber || 0;

        setGuestNumber(totalRequested);
        setGuestCounts({
          [selectedRoom.room_type]: totalRequested
        });

        setAdultCounts({
          [selectedRoom.room_type]: initialAdultCount
        });
        setChildrenCounts({
          [selectedRoom.room_type]: initialChildrenCount
        });
      } else {
        // If total exceeds capacity, distribute proportionally
        const initialAdultCount = Math.min(adultNumber || 1, maxCapacity);
        const initialChildrenCount = Math.min(childrenNumber || 0, maxCapacity - initialAdultCount);
        const totalGuests = initialAdultCount + initialChildrenCount;

        setGuestNumber(totalGuests);
        setGuestCounts({
          [selectedRoom.room_type]: totalGuests
        });
        setAdultCounts({
          [selectedRoom.room_type]: initialAdultCount
        });
        setChildrenCounts({
          [selectedRoom.room_type]: initialChildrenCount
        });
      }
    }
  }, [open, rooms, selectedRoom, adultNumber, childrenNumber]);

  useEffect(() => {
    const updatedCounts = { ...guestCounts };
    selectedRooms.forEach(room => {
      if (!updatedCounts[room.room_type]) {
        updatedCounts[room.room_type] = Math.min(
          parseInt(localStorage.getItem('guestNumber')) || 1,
          room.max_capacity || 1
        );
      }
    });
    setGuestCounts(updatedCounts);
  }, [selectedRooms]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      walkinfirstname: "",
      walkinlastname: "",
      email: "",
      contactNumber: "",

    },
  })

  const handleRemoveRoom = (indexRemove) => {
    const updatedRooms = selectedRooms.filter((_, index) => index !== indexRemove);
    setSelectedRooms(updatedRooms);

    if (updatedRooms.length === 0) {
      setGuestNumber(0);
      setNumberOfNights(1);
      toast.info("Room selection cleared!");
    } else {
      toast.info("Room removed.");
    }
  };


  return (
    <>

      <Sheet open={open} onOpenChange={setOpen} >
        <SheetTrigger asChild>
          <Button >Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-6 border-none rounded-t-3xl ">
          <ScrollArea className="h-[100vh] md:h-[calc(100vh-300px)]" >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-2 mb-2 p-4">
                  <Card className="bg-transparent shadow-xl">
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        <div>

                          <Label className="mb-3">Check In</Label>
                          <Input
                            value={checkIn}
                            readOnly
                          />
                        </div>
                        <div >
                          <Label className="mb-3">Check Out</Label>
                          <Input
                            value={checkOut}
                            readOnly
                          />
                        </div>






                        <div >

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
                        <div >
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
                        <div >
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
                        <div >
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

                      </div>
                    </CardContent>

                  </Card>






                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">

                  <Card className="bg-transparent shadow-xl">
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                        <div className="flex justify-end">
                          <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
                        </div>

                      </div>
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div >
                          {selectedRooms.length > 0 ? (
                            <>
                              {selectedRooms.map((room, index) => (
                                <div key={index}>
                                  <div className="flex justify-end">
                                    <Trash2 className="cursor-pointer text-red-500"
                                      onClick={() => handleRemoveRoom(index)}
                                    />

                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                    <div>
                                      <h1 className="font-semibold text-2xl text-blue-500 font-playfair">{room.roomtype_name}</h1>
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
                                      <h1 className="font-semibold text-blue-500"> ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                                    
                                      <div className="mt-4 space-y-3">
                                        <div>
                                          <Label className={"mb-2"}>Adults</Label>
                                          <div className="flex items-center justify-start space-x-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                const currentAdults = parseInt(localStorage.getItem('adultNumber')) || adultNumber || 1;
                                                const newAdults = Math.max(currentAdults - 1, 1);
                                                localStorage.setItem('adultNumber', newAdults.toString());
                                                window.location.reload();
                                              }}
                                              disabled={(parseInt(localStorage.getItem('adultNumber')) || adultNumber || 1) <= 1}
                                            >
                                              <MinusIcon />
                                            </Button>

                                            <Input
                                              className="w-1/4 text-center"
                                              type="number"
                                              value={localStorage.getItem('adultNumber') || adultNumber || 1}
                                              onChange={(e) => {
                                                const newValue = parseInt(e.target.value) || 1;
                                                localStorage.setItem('adultNumber', newValue.toString());
                                                window.location.reload();
                                              }}
                                            />

                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                const currentAdults = parseInt(localStorage.getItem('adultNumber')) || adultNumber || 1;
                                                const newAdults = currentAdults + 1;
                                                localStorage.setItem('adultNumber', newAdults.toString());
                                                window.location.reload();
                                              }}
                                            >
                                              <Plus />
                                            </Button>
                                          </div>
                                        </div>

                                        <div>
                                          <Label className={"mb-2"}>Children</Label>
                                          <div className="flex items-center justify-start space-x-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                const currentChildren = parseInt(localStorage.getItem('childrenNumber')) || childrenNumber || 0;
                                                const newChildren = Math.max(currentChildren - 1, 0);
                                                localStorage.setItem('childrenNumber', newChildren.toString());
                                                window.location.reload();
                                              }}
                                              disabled={(parseInt(localStorage.getItem('childrenNumber')) || childrenNumber || 0) <= 0}
                                            >
                                              <MinusIcon />
                                            </Button>

                                            <Input
                                              className="w-1/4 text-center"
                                              type="number"
                                              value={localStorage.getItem('childrenNumber') || childrenNumber || 0}
                                              onChange={(e) => {
                                                const newValue = parseInt(e.target.value) || 0;
                                                localStorage.setItem('childrenNumber', newValue.toString());
                                                window.location.reload();
                                              }}
                                            />

                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                const currentChildren = parseInt(localStorage.getItem('childrenNumber')) || childrenNumber || 0;
                                                const newChildren = currentChildren + 1;
                                                localStorage.setItem('childrenNumber', newChildren.toString());
                                                window.location.reload();
                                              }}
                                            >
                                              <Plus />
                                            </Button>
                                          </div>
                                        </div>


                                      </div>
                                    </div>


                                    <div className="flex justify-center">
                                      <Carousel className="w-full max-w-[280px]">
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
                                    </div>



                                  </div>
                                  <div >


                                    <Card className="w-full mt-2  ">
                                      <CardContent>
                                        <div className="flex items-center justify-between w-full ">

                                          {/* Label + Icon + Title */}
                                          <div className="flex flex-col">
                                            <Label>Extra</Label>
                                            <div className="flex items-center gap-2">
                                              <h1><BedIcon /></h1>
                                              <h1>Extra Bed</h1>
                                            </div>
                                          </div>

                                          {/* Price */}
                                          <div className="flex flex-col items-end">
                                            <Label>Price</Label>
                                            <h1 className="text-blue-500 whitespace-nowrap">₱ 500.00</h1>
                                          </div>

                                          {/* Quantity */}
                                          <div className="flex flex-col items-center">
                                            <Label>Quantity</Label>
                                            <div className="flex items-center space-x-2 mt-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                              // disabled={guestNumber === 0}
                                              >
                                                <MinusIcon />
                                              </Button>
                                              <Input
                                                className="w-16 text-center"
                                                type="number"
                                              // value={guestNumber}
                                              />
                                              <Button
                                                type="button"
                                                variant="outline"
                                              //  onClick={() => setGuestNumber(guestNumber + 1)}
                                              >
                                                <Plus />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  <Separator className="w-full mt-4" />
                                </div>

                              ))}
                            </>
                          ) : (
                            <p>No rooms selected</p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  <div className=" space-y-3 ">
                    <Card className="bg-transparent shadow-xl">
                      <CardContent className="space-y-3 text-black ">
                        <h1 className="font-semibold text-lg">BOOKING SUMMARY</h1>
                        {selectedRooms.length > 0 ? selectedRooms.map((room, index) => (
                          <div>

                            <div key={index} className="flex justify-between items-center py-2 ">
                              <h1 className="font-semibold  ">Room Type: {room.roomtype_name}</h1>
                              <h1 className="text-xl md:text-2xl" >₱ {(Number(room.roomtype_price) * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>


                            </div>

                            <h1 className="text-end text-xl md:text-xl">{`(${numberOfNights} Nights x ₱ ${(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}</h1>
                            <Separator className="w-full mt-4" />
                          </div>

                        )) : null}
                        <div className="flex justify-between items-center py-2 ">
                          <h1 className="font-semibold">VAT (12%)</h1>
                          <h1 className=" md:text-xl">
                            ₱ {selectedRooms.reduce((total, room) => {
                              const roomTotal = Number(room.roomtype_price) * numberOfNights;
                              const basePrice = roomTotal / 1.12;
                              const vatAmount = roomTotal - basePrice;  // Or basePrice * 0.12
                              return total + vatAmount;
                            }, 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h1>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <h1 className="font-semibold">Sub Total</h1>
                          <h1 className="md:text-2xl">
                            ₱ {selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0)
                              .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h1>
                        </div>




                        <div className="flex justify-end my-2">
                          <hr className="w-1/5 h-1 bg-black border-none" />
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <h1 className="font-semibold">Total Amount:</h1>
                          <h1 className="font-semibold md:text-2xl">
                            ₱ {selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0)
                              .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h1>
                        </div>



                        <div className="flex justify-between items-center py-2">
                          <h1 className="font-semibold">Down Payment (50%):</h1>
                          <h1 className="font-semibold md:text-2xl text-blue-500">
                            ₱ {(selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0) / 2)
                              .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h1>
                        </div>

                      </CardContent>


                    </Card>
                    <Card className="bg-transparent shadow-xl">
                      <CardContent>
                        <h1>PAYMENT METHOD</h1>
                      </CardContent>

                    </Card>
                    <Button
                      onClick={() => {
                        // First validate the form
                        form.handleSubmit((data) => {
                          if (selectedRooms.length === 0) return;

                          const subtotal = selectedRooms.reduce(
                            (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                            0
                          );
                          const vat = subtotal * 0.12;
                          const total = subtotal + vat;
                          const downpayment = total * 0.5;

                          setSummaryInfo({
                            rooms: selectedRooms.map(room => {
                              const currentAdults = parseInt(localStorage.getItem('adultNumber')) || adultNumber || 1;
                              const currentChildren = parseInt(localStorage.getItem('childrenNumber')) || childrenNumber || 0;
                              const totalGuests = currentAdults + currentChildren;

                              return {
                                ...room,
                                guestCount: totalGuests,
                                adultCount: currentAdults,
                                childrenCount: currentChildren,
                                extraBeds: extraBedCounts[room.room_type] || 0,
                              };
                            }),

                            checkIn,
                            checkOut,
                            numberOfNights,
                            vat,
                            total,
                            downpayment,
                          });

                          setShowConfirmModal(true);
                        })();
                      }}
                    >
                      Confirm Booking
                    </Button>

                    {showConfirmModal &&
                      <ConfirmBooking
                        open={() => setShowConfirmModal(true)}
                        onClose={() => setShowConfirmModal(false)}
                        // onOpenChange={setShowConfirmModal}
                        summary={summaryInfo}
                        onConfirmBooking={onSubmit}
                      />
                    }

                  </div>



                </div>

              </form>
            </Form>

          </ScrollArea>



        </SheetContent>

      </Sheet>
    </>
  )
}

export default BookingNoAccount