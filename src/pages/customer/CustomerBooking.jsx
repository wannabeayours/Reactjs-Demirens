import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { ArrowBigRight, Bed, Info, MinusCircle, MinusIcon, Plus, PlusIcon, Square, User } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import DatePicker from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import BookingNoAccount from './modals/sheets/BookingNoAccount'



const schema = z.object({
  checkIn: z.string().min(1, { message: "Check in is required" }),
  checkOut: z.string().min(1, { message: "Check out is required" }),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return false;
  }


  const normalize = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());

  return normalize(checkOut).getTime() > normalize(checkIn).getTime();
}, {
  message: "Check out must be later than check in",
  path: ["checkOut"],
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const now = new Date();
  return checkIn.getTime() > now.getTime();
}, {
  message: "Check in must be in the future",
  path: ["checkIn"],
});



function CustomerBooking() {
  const [rooms, setRooms] = useState([]);
  const [guestNumber, setGuestNumber] = useState(0);
  const [isSearched, setIsSearched] = useState(false);


  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn: "",
      checkOut: "",

    },
  })


  const getRooms = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getRooms");
      const res = await axios.post(url, formData);
      console.log("res ni getRooms", res);
      setRooms(res.data !== 0 ? res.data : {});
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const onSubmit = async (data) => {
    localStorage.setItem("checkIn", data.checkIn);
    localStorage.setItem("checkOut", data.checkOut);
    localStorage.setItem("guestNumber", guestNumber);
    setIsSearched(true);



  }
  useEffect(() => {
    getRooms();
  }, []);



  return (
    <div className="bg-transparent min-h-screen text-white">

      <div
        className="flex items-center justify-center h-[50vh] bg-secondary bg-fixed bg-center bg-cover"
        style={{ backgroundImage: 'url("/assets/images/hotels.jpg")' }}
      >
        <Card className=" w-full max-w-5xl">
          <CardContent>
            <Form {...form}>

              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <DatePicker
                        form={form}
                        name={field.name}
                        label="Check-in"
                        pastAllowed={false}
                        futureAllowed={true}
                        withTime={true}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <DatePicker
                        form={form}
                        name={field.name}
                        label="Check-out"
                        pastAllowed={false}
                        futureAllowed={true}
                        withTime={true}
                      />
                    </FormItem>
                  )}
                />
                <div>
                  <Label className={"mb-2 "}>Number of Guests</Label>
                  <div className="flex items-center justify-start space-x-2">

                    <Button type="button" variant="outline" onClick={() => setGuestNumber(guestNumber - 1)} disabled={guestNumber === 0}><MinusIcon /></Button>
                    <Input
                      className="w-1/4"
                      type="number"
                      readOnly
                      value={guestNumber}


                    />
                    <Button type="button" variant="outline" onClick={() => setGuestNumber(guestNumber + 1)}><Plus /></Button>

                  </div>

                </div>
                <div className="flex items-center justify-start mt-5 ">
                  <Button className="w-full bg-[#FDF5AA] hover:bg-yellow-600 text-black">Search</Button>
                </div>


              </form>

            </Form>
          </CardContent>

        </Card>

      </div>


      <div className="flex flex-col items-center justify-center py-10 px-4 ">

        {!isSearched ? (
          <p className="text-center text-lg font-semibold text-[#bba008] mt-10">
            Please check in, check out, and enter number of guests first.
          </p>
        ) : rooms.filter(room => room.status_id === 3 && room.max_capacity >= guestNumber).length === 0 ? (
          <p className="text-center text-lg font-semibold text-gray-600 mt-10">
            No rooms available for {guestNumber} guest(s).
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms
              .filter(room => room.status_id === 3 && room.max_capacity >= guestNumber)
              .map((room, index) => (
                <Card key={index} className="flex flex-col h-full rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white">
                  {/* Room Image */}
                  <div className="relative">
                    <img
                      src={room.roomtype_image || room.images?.[0]} // fallback if needed
                      alt={room.roomtype_name}
                      className="w-full h-52 object-cover rounded-t-2xl"
                    />
                    <Badge className={`absolute top-3 right-3 ${room.status_id === 3 ? 'bg-green-500' : 'bg-red-500'}`}>
                      {room.status_name}
                    </Badge>
                  </div>

                  <CardContent className="flex flex-col flex-1 p-4 space-y-4">
                    {/* Title & Description */}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{room.roomtype_name}</h2>
                      <p className="text-sm text-gray-600 mt-1">{room.roomtype_description}</p>
                    </div>

                    {/* Info Links */}
                    <Link className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                      More info <Info size={16} />
                    </Link>

                    {/* Price */}
                    <div className="text-lg font-semibold text-blue-600">
                      ₱ {Number(room.roomtype_price).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>

                    {/* Room Features */}
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                        <User size={16} />
                        {room.max_capacity} Guest{room.max_capacity > 1 && 's'}
                      </div>
                      <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                        <Bed size={16} />
                        2 Beds
                      </div>
                      <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                        <Square size={16} />
                        23 m²
                      </div>
                    </div>

                    {/* Book Button */}
                    <div className="mt-auto">
                      {room.status_id === 3 ? (
                        <BookingNoAccount rooms={rooms} selectedRoom={room} />
                      ) : (
                        <Button disabled className="w-full">Book Now</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}



      </div>
    </div>
  )
}

export default CustomerBooking