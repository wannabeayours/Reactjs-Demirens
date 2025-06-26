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

  }
  useEffect(() => {
    getRooms();
  }, []);



  return (
    <div >

    <div className="flex items-center justify-center h-[50vh] bg-secondary">
      <Card >
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
                <Label className={"mb-2"}>Number of Guests</Label>
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
                <Button className="w-full">Search</Button>
              </div>


            </form>

          </Form>
        </CardContent>

      </Card>

    </div>

    <div className="flex flex-col items-center justify-center py-10 px-4 ">
     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {rooms.length === 0 ? <p>No rooms available</p> : rooms.map((room, index) => (
          <Card key={index} className="flex flex-col h-full shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <img src={room.roomtype_image} alt="Room" className="w-full h-48 object-cover" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-lg font-semibold">{room.roomtype_name}</h5>
                <div className="flex justify-between items-center mb-2">
                  <Badge className={room.status_id === 3 ? "bg-green-500" : "bg-red-500"}>{room.status_name}</Badge>
                </div>
              </div>
              <div>
                <h5>{room.roomtype_description}</h5>
                <Link>
                  <div className="flex flex-row space-x-2 text-blue-500">
                    <div>
                      More info
                    </div>
                    <div>
                      <Info />
                    </div>

                  </div>
                </Link>
              </div>
              <div className="mb-6 mt-6" >
                <h2 className="text-lg font-semibold text-blue-600">₱ {room.roomtype_price}</h2>
              </div>

              <div>
                {/* Top row badges */}
                <div className="flex flex-row gap-4 mb-3">
                  <div className="bg-secondary rounded-full p-2 flex items-center gap-1.5 w-fit">
                    <User className="w-4 h-4" />
                    <h3 className="text-sm">3 Guests</h3>
                  </div>
                  <div className="bg-secondary rounded-full p-2 flex items-center gap-1.5 w-fit">
                    <Square className="w-4 h-4" />
                    <h3 className="text-sm">23 m2</h3>
                  </div>
                </div>

                {/* Separate badge below */}
                <div className="bg-secondary rounded-full p-2 flex items-center gap-1.5 w-fit mb-3">
                  <Bed className="w-4 h-4" />
                  <h3 className="text-sm">2 Beds</h3>
                </div>
              </div>

              <div className="mt-auto">
                {
                  room.status_id === 3 ?
                    <BookingNoAccount rooms={rooms} selectedRoom={room} /> :
                    <Button disabled className="w-full">Book Now</Button>
                }

              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
  )
}

export default CustomerBooking