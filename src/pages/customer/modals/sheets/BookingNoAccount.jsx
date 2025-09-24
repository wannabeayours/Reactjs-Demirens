import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Info, MinusIcon, Plus, Trash2, BedDouble } from 'lucide-react'
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

// ---------------------- Utilities ----------------------
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

function BookingNoAccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {
  // ---------------------- Initial values ----------------------
  const initialCheckIn = getStoredYMDDate('checkIn', 1);
  const initialCheckOutCandidate = getStoredYMDDate('checkOut', 2);
  const _minOut = new Date(initialCheckIn); _minOut.setDate(_minOut.getDate() + 1); _minOut.setHours(0, 0, 0, 0);
  const initialCheckOut = (initialCheckOutCandidate && initialCheckOutCandidate.getTime() > _minOut.getTime())
    ? initialCheckOutCandidate
    : _minOut;

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

  // ---------------------- Form validation ----------------------
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

  // ---------------------- Booking function ----------------------
  const customerBookingNoAccount = async (values) => {
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(checkIn).getTime() <= today.getTime()) {
        toast.error("Check-in date cannot be today or earlier.");
        return;
      }

      const url = localStorage.getItem('url') + "customer.php";

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
        children: localStorage.getItem("children") || 0,
        adult: localStorage.getItem("adult") || 1
      };

      const roomDetails = selectedRooms.map((room) => {
        const roomKey = String(room.unique_id || room.room_type);
        const adultCount = Number(adultCounts[roomKey] || 0);
        const childrenCount = Number(childrenCounts[roomKey] || 0);
        return {
          roomTypeId: room.room_type,
          guestCount: adultCount + childrenCount,
          adultCount,
          childrenCount,
        };
      });

      const jsonData = {
        walkinfirstname: values.walkinfirstname,
        walkinlastname: values.walkinlastname,
        email: values.email,
        contactNumber: values.contactNumber,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      };

      const formData = new FormData();
      formData.append("operation", "customerBookingNoAccount");
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
  }

  // ---------------------- Effects ----------------------
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn); inDate.setHours(0, 0, 0, 0);
      const outDate = new Date(checkOut); outDate.setHours(0, 0, 0, 0);
      const diff = outDate.getTime() - inDate.getTime();
      const days = Math.max(1, diff / (1000 * 60 * 60 * 24));
      setNumberOfNights(days);
    }
  }, [checkIn, checkOut]);

  // ---------------------- Room selection ----------------------
  const handleRemoveRoom = (indexRemove) => {
    const roomToRemove = selectedRooms[indexRemove];
    const updatedRooms = selectedRooms.filter((_, index) => index !== indexRemove);
    setSelectedRooms(updatedRooms);

    if (roomToRemove) {
      const roomKey = String(roomToRemove.unique_id || roomToRemove.room_type);
      setGuestCounts(prev => { const u = { ...prev }; delete u[roomKey]; return u; });
      setAdultCounts(prev => { const u = { ...prev }; delete u[roomKey]; return u; });
      setChildrenCounts(prev => { const u = { ...prev }; delete u[roomKey]; return u; });
    }

    if (updatedRooms.length === 0) {
      setNumberOfNights(1);
      toast.info("Room selection cleared!");
    } else {
      toast.info("Room removed.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Book Now</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="text-black p-6 border-none rounded-t-3xl bg-white">
        <div className="h-[100vh] overflow-y-auto">

          {/* Dates only (removed global adults/children here) */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 w-full mb-4">
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500">Check-in</div>
              <input
                type="date"
                className="w-full rounded-md border px-2 py-1"
                value={formatYMD(checkIn)}
                min={formatYMD(new Date(Date.now() + 86400000))}
                onChange={(e) => {
                  const newDate = parseYMD(e.target.value);
                  if (!newDate) return;
                  setCheckIn(newDate);
                  localStorage.setItem('checkIn', e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500">Check-out</div>
              <input
                type="date"
                className="w-full rounded-md border px-2 py-1"
                value={formatYMD(checkOut)}
                min={formatYMD(new Date(checkIn.getTime() + 86400000))}
                onChange={(e) => {
                  const newDate = parseYMD(e.target.value);
                  if (!newDate) return;
                  setCheckOut(newDate);
                  localStorage.setItem('checkOut', e.target.value);
                }}
              />
            </div>
          </div>

          {/* Selected Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white shadow-xl">
              <CardContent>
                {selectedRooms.length > 0 ? (
                  selectedRooms.map((room, index) => (
                    <Card key={index} className="mb-3">
                      <CardContent>
                        <div className="flex justify-between">
                          <h1 className="text-xl font-semibold text-blue-500">{room.roomtype_name}</h1>
                          <Trash2 className="cursor-pointer text-red-500" onClick={() => handleRemoveRoom(index)} />
                        </div>

                        {/* Adults & Children per room */}
                        <div className="mt-2 flex gap-4">
                          <div>
                            <Label>Adults</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                onClick={() => {
                                  const k = String(room.room_type);
                                  setAdultCounts(prev => ({ ...prev, [k]: Math.max(0, (prev[k] || 0) - 1) }));
                                }}
                                disabled={(adultCounts[String(room.room_type)] || 0) <= 0}
                              ><MinusIcon /></Button>
                              {Number(adultCounts[String(room.room_type)] || 0)}
                              <Button
                                type="button"
                                onClick={() => {
                                  const k = String(room.room_type);
                                  const currentA = adultCounts[k] || 0;
                                  const currentC = childrenCounts[k] || 0;
                                  if (currentA + currentC < room.roomtype_capacity) {
                                    setAdultCounts(prev => ({ ...prev, [k]: currentA + 1 }));
                                  }
                                }}
                              ><Plus /></Button>
                            </div>
                          </div>

                          <div>
                            <Label>Children</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                onClick={() => {
                                  const k = String(room.room_type);
                                  setChildrenCounts(prev => ({ ...prev, [k]: Math.max(0, (prev[k] || 0) - 1) }));
                                }}
                                disabled={(childrenCounts[String(room.room_type)] || 0) <= 0}
                              ><MinusIcon /></Button>
                              {Number(childrenCounts[String(room.room_type)] || 0)}
                              <Button
                                type="button"
                                onClick={() => {
                                  const k = String(room.room_type);
                                  const currentA = adultCounts[k] || 0;
                                  const currentC = childrenCounts[k] || 0;
                                  if (currentA + currentC < room.roomtype_capacity) {
                                    setChildrenCounts(prev => ({ ...prev, [k]: currentC + 1 }));
                                  }
                                }}
                              ><Plus /></Button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          Total guests: {(Number(adultCounts[String(room.room_type)] || 0) + Number(childrenCounts[String(room.room_type)] || 0))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No rooms selected</p>
                )}
              </CardContent>
            </Card>

            {/* Booking form */}
            <ScrollArea className="h-[80vh]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(customerBookingNoAccount)}>
                  <Card className="bg-white shadow-md p-4">
                    <FormField control={form.control} name="walkinfirstname" render={({ field }) => (
                      <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="walkinlastname" render={({ field }) => (
                      <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactNumber" render={({ field }) => (
                      <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </Card>
                  <Button type="submit" className="mt-4 w-full">Confirm Booking</Button>
                </form>
              </Form>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BookingNoAccount
