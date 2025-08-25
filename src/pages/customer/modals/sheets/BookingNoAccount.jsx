import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'

import { BedIcon, Info, MinusIcon, Plus, Trash2 } from 'lucide-react'
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
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [numberOfNights, setNumberOfNights] = useState(1);
  const [open, setOpen] = useState(false)
  const [allRooms, setAllRooms] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [extraBedCounts, setExtraBedCounts] = useState({});
  // Simple counters for current room selection
  const [adultCount, setAdultCount] = useState(() => {
    const stored = parseInt(localStorage.getItem('adultNumber'))
    return Number.isFinite(stored) ? stored : (adultNumber || 1)
  });
  const [childrenCount, setChildrenCount] = useState(() => {
    const stored = parseInt(localStorage.getItem('childrenNumber'))
    return Number.isFinite(stored) ? stored : (childrenNumber || 0)
  });

  const onSubmit = async (data) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const subtotal = selectedRooms.reduce((sum, room) => sum + Number(room.roomtype_price) * numberOfNights, 0)
      // Prices are VAT-inclusive. VAT is shown only, not added to total.
      const displayedVat = subtotal - (subtotal / 1.12)
      const totalAmount = subtotal
      const downPayment = totalAmount * 0.5
      const currentAdults = adultCount || adultNumber || 1
      const currentChildren = childrenCount || childrenNumber || 0
      const totalGuests = currentAdults + currentChildren

      const jsonData = {
        customers_walk_in_fname: data.walkinfirstname,
        customers_walk_in_lname: data.walkinlastname,
        customers_walk_in_email: data.email,
        customers_walk_in_phone_number: data.contactNumber,
        booking_checkin_dateandtime: checkIn.toISOString(),
        booking_checkout_dateandtime: checkOut.toISOString(),
        booking_downpayment: downPayment.toFixed(2),
        roomtype_id: (selectedRooms[0] && (selectedRooms[0].roomtype_id || selectedRooms[0].room_type)) || selectedRoom?.room_type,
        room_count: 1,
        guest_number: totalGuests,
        adult_number: currentAdults,
        children_number: currentChildren,
      };

      console.log('Submitting booking data:', jsonData);

      const formData = new FormData();
      // Optional: include VAT shown to customer for records (not added to total)
      jsonData.displayed_vat = displayedVat.toFixed(2)
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
    if (!open) return
    const checkInStr = localStorage.getItem('checkIn')
    const checkOutStr = localStorage.getItem('checkOut')
    const checkInDate = checkInStr ? new Date(checkInStr) : new Date()
    const checkOutDate = checkOutStr ? new Date(checkOutStr) : new Date()
    setCheckIn(checkInDate)
    setCheckOut(checkOutDate)

    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    setNumberOfNights(diffDays)

    setAllRooms(rooms)
    if (selectedRoom) {
      setSelectedRooms([{
        roomtype_name: selectedRoom.roomtype_name,
        roomtype_price: selectedRoom.roomtype_price,
        roomtype_id: selectedRoom.room_type,
        roomtype_description: selectedRoom.roomtype_description,
        max_capacity: selectedRoom.max_capacity,
        room_type: selectedRoom.room_type,
      }])
    }

    const initAdults = adultNumber || parseInt(localStorage.getItem('adultNumber')) || 1
    const initChildren = childrenNumber || parseInt(localStorage.getItem('childrenNumber')) || 0
    setAdultCount(initAdults)
    setChildrenCount(initChildren)
  }, [open, rooms, selectedRoom, adultNumber, childrenNumber])

  const maxCapacity = selectedRooms[0]?.max_capacity || selectedRoom?.max_capacity || 1
  const totalGuestsNow = adultCount + childrenCount
  const canIncrement = totalGuestsNow < maxCapacity

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
          <Button>Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-6 border-none rounded-t-3xl bg-white">
          <ScrollArea className="h-[100vh] md:h-[calc(100vh-300px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 mt-2 mb-2 p-4">
                  <Card className="bg-white shadow-xl">
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2">Check-in</Label>
                          <Input value={checkIn.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} readOnly />
                        </div>
                        <div>
                          <Label className="mb-2">Check-out</Label>
                          <Input value={checkOut.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} readOnly />
                        </div>






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

                      </div>
                    </CardContent>

                  </Card>






                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">

                  <Card className="bg-white shadow-xl">
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Selected Room</h2>
                        <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
                      </div>
                      <ScrollArea className="h-[calc(100vh-320px)]">
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
                                      <h1 className="font-semibold text-2xl text-blue-600 font-playfair">{room.roomtype_name}</h1>
                                      <p className="text-sm text-muted-foreground">{room.roomtype_description}</p>
                                      <Link>
                                        <div className="flex flex-row items-center gap-2 mt-3 mb-2 text-blue-600">
                                          <Moreinfo room={room} />
                                          <Info size={18} />
                                        </div>
                                      </Link>
                                      <h1 className="font-semibold text-blue-600">₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                                    
                                      <div className="mt-4 space-y-3">
                                        <div>
                                          <Label className="mb-2">Adults</Label>
                                          <div className="flex items-center justify-start gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                const val = Math.max(1, adultCount - 1)
                                                setAdultCount(val)
                                                localStorage.setItem('adultNumber', String(val))
                                              }}
                                              disabled={adultCount <= 1}
                                            >
                                              <MinusIcon size={16} />
                                            </Button>
                                            <div className="w-12 text-center font-medium">{adultCount}</div>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                if (!canIncrement) return toast.info(`Max capacity ${maxCapacity}`)
                                                const val = adultCount + 1
                                                setAdultCount(val)
                                                localStorage.setItem('adultNumber', String(val))
                                              }}
                                              disabled={!canIncrement}
                                            >
                                              <Plus size={16} />
                                            </Button>
                                          </div>
                                        </div>

                                        <div>
                                          <Label className="mb-2">Children</Label>
                                          <div className="flex items-center justify-start gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                const val = Math.max(0, childrenCount - 1)
                                                setChildrenCount(val)
                                                localStorage.setItem('childrenNumber', String(val))
                                              }}
                                              disabled={childrenCount <= 0}
                                            >
                                              <MinusIcon size={16} />
                                            </Button>
                                            <div className="w-12 text-center font-medium">{childrenCount}</div>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                if (!canIncrement) return toast.info(`Max capacity ${maxCapacity}`)
                                                const val = childrenCount + 1
                                                setChildrenCount(val)
                                                localStorage.setItem('childrenNumber', String(val))
                                              }}
                                              disabled={!canIncrement}
                                            >
                                              <Plus size={16} />
                                            </Button>
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Max capacity: {maxCapacity} guests</p>
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
                                  <div>
                                    <Card className="w-full mt-2">
                                      <CardContent>
                                        <div className="flex items-center justify-between w-full ">

                                          <div className="flex flex-col">
                                            <Label>Extra</Label>
                                            <div className="flex items-center gap-2">
                                              <BedIcon size={18} />
                                              <span>Extra Bed</span>
                                            </div>
                                          </div>

                                          <div className="flex flex-col items-end">
                                            <Label>Price</Label>
                                            <h1 className="text-blue-500 whitespace-nowrap">₱ 500.00</h1>
                                          </div>

                                          <div className="flex flex-col items-center">
                                            <Label>Quantity</Label>
                                            <div className="flex items-center space-x-2 mt-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                  const id = room.room_type || room.roomtype_id
                                                  const current = extraBedCounts[id] || 0
                                                  const next = Math.max(0, current - 1)
                                                  setExtraBedCounts({ ...extraBedCounts, [id]: next })
                                                }}
                                              >
                                                <MinusIcon size={16} />
                                              </Button>
                                              <div className="w-12 text-center font-medium">{extraBedCounts[room.room_type || room.roomtype_id] || 0}</div>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                  const id = room.room_type || room.roomtype_id
                                                  const current = extraBedCounts[id] || 0
                                                  const next = current + 1
                                                  setExtraBedCounts({ ...extraBedCounts, [id]: next })
                                                }}
                                              >
                                                <Plus size={16} />
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
                  <div className="space-y-3 md:sticky md:top-4 h-fit">
                    <Card className="bg-white shadow-xl">
                      <CardContent className="space-y-3 text-black">
                        <h1 className="font-semibold text-lg">Booking Summary</h1>
                        {selectedRooms.length > 0 && selectedRooms.map((room, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center py-2">
                              <h2 className="font-medium">Room Type: {room.roomtype_name}</h2>
                              <p className="text-right font-semibold text-xl">{`${numberOfNights} Day(s) x ₱ ${(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
                            </div>
                            <Separator className="w-full mt-4" />
                          </div>
                        ))}
                        {(() => {
                        const subtotal = selectedRooms.reduce((t, r) => t + Number(r.roomtype_price) * numberOfNights, 0);
                        const vat = subtotal - (subtotal / 1.12); 
                          const total = subtotal
                          const down = total * 0.5
                          return (
                            <>
                           
                              <div className="flex justify-between items-center py-2 ">
                                <span className="font-medium">VAT (12%) included</span>
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
                    <Card className="bg-white shadow-xl">
                      <CardContent className="space-y-2">
                        <h2 className="font-semibold">Payment Method</h2>
                        <p className="text-sm text-muted-foreground">You will receive payment instructions after confirming your booking.</p>
                      </CardContent>
                    </Card>

                    <Button
                      type="button"
                      onClick={() => {
                        // First validate the form
                        form.handleSubmit((data) => {
                          if (selectedRooms.length === 0) return;

                          const subtotal = selectedRooms.reduce(
                            (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                            0
                          );
                          const vat = subtotal - (subtotal / 1.12);
                          const total = subtotal;
                          const downpayment = total * 0.5;

                          setSummaryInfo({
                            rooms: selectedRooms.map(room => {
                              const currentAdults = adultCount || 1;
                              const currentChildren = childrenCount || 0;
                              const totalGuests = currentAdults + currentChildren;

                              return {
                                ...room,
                                guestCount: totalGuests,
                                adultCount: currentAdults,
                                childrenCount: currentChildren,
                                extraBeds: extraBedCounts[room.room_type || room.roomtype_id] || 0,
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