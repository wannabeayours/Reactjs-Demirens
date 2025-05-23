import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { ArrowBigRight, Bed, PlusIcon, Square, User } from 'lucide-react'
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
import BookingWaccount from './modals/sheets/BookingWaccount'

const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  contactNumber: z.string().min(1, { message: "Contact number is required" }),
})



function CustomerDashboard() {
  const [rooms, setRooms] = useState([]);



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
  useEffect(() => {
    getRooms();
  }, []);


  return (

    <div >

      <div className="flex items-center justify-center h-[50vh] bg-gray-100">
        <h1 className="text-2xl font-bold text-center">DIRI TONG CHECK IN CHECK OUT</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-10 px-4 ">
        {/* <Card className="flex flex-col md:flex-row w-full max-w-5xl p-6 gap-6">
    
              <div className="w-full md:w-2/5">
                <Carousel className="w-full">
                  <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index}>
                        <div className="bg-gray-100 aspect-square flex items-center justify-center rounded-lg">
                          <span className="text-4xl font-semibold text-gray-400">{index + 1}</span>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
              <div className="w-full md:w-3/5 flex flex-col justify-between">
                <div >
                  <h2 className="text-xl font-semibold">ROOM TYPE</h2>
                  <Drawer>
                    <DrawerTrigger>
                      <Button variant="link">More Info
                        <ArrowBigRight className="ml-2" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="flex flex-row">
                        <div className="w-full md:w-1/4 ml-4 mb-4 ">
                          <Carousel>
                            <CarouselContent>
                              {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index}>
                                  <div className="bg-gray-100 aspect-square flex items-center justify-center rounded-lg">
                                    <span className="text-4xl font-semibold text-gray-400">{index + 1}</span>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                          </Carousel>
                        </div>
                        <div  >
                          <div className="ml-6">
                            <h2 className="text-xl font-semibold">ROOM TYPE</h2>
                          </div>
                          <div className="ml-6">
                            <p className="text-gray-600 mt-1 mb-4">Room Description</p>
                          </div>
                          <div className='ml-6'>
                            <h3>
                              <span className="font-semibold">Capacity:</span>
                            </h3>
                          </div>
                          <div className='ml-6 mt-6'>
                            <h3>
                              <span className="font-semibold">Price:</span>
                            </h3>
                          </div>
                          <div className='ml-6 mt-6'>
                            <h3>
                              <span className="font-semibold">Amenities Included:</span>
                            </h3>
                          </div>
                        </div>
    
                      </div>
    
                    </DrawerContent>
                  </Drawer>
                </div>
    
                <div className="grid grid-cols-3 gap-4 mt-6 items-center">
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                  </div>
                  <div className="text-right">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          BOOK
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh]">
                        <div className='flex flex-row justify-center'>
    
                          <div >
                            
                            <Card className="w-full max-w-lg p-6 space-y-2 mt-10">
                              <CardTitle>Payment Method</CardTitle>
    
                              <CardContent>
                                <div>
                                  pilianan sa mga shet
                                </div>
                                <Form {...form}>
                                  <form className="space-y-2 mt-6">
    
                                    <div className="flex space-x-2">
    
                                      <FormField
                                        control={form.control}
                                        name="ref"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Reference Number:</FormLabel>
                                            <FormControl>
                                              <Input placeholder="#" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <div>
                                      diri dayn kay attach proof of payable
                                    </div>
    
    
    
                                  </form>
                                </Form>
    
                              </CardContent>
    
                            </Card>
                          </div>
                          <div className="w-1/2 bg-cover bg-center ml-6">
    
                            <Card className="w-full max-w-lg p-6 space-y-2 ml-20 mt-10">
    
                              <div className="flex justify-between items-center mb-4">
                                <CardTitle>Booking Details</CardTitle>
                                <Button >
                                  <PlusIcon />
                                  Room
                                </Button>
                              </div>
    
                              <CardContent>
                                dere kau booking details malamang
                              </CardContent>
                              <Button >
                                  Pay Now
                                </Button>
                            </Card>
    
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </Card> */}
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
                    <Badge variant={room.status_id === 3 ? "default" : "destructive"} >{room.status_name}</Badge>
                  </div>
                </div>
                <div>
                  <h5>{room.roomtype_description}</h5>
                </div>
                <div className="mb-6 mt-6" >
                  <h2 className="text-lg font-semibold text-blue-600">₱ {room.roomtype_price}</h2>
                </div>
                <div>
                  {/* Top row badges */}
                  <div className="flex flex-row gap-4 mb-3">
                    <div className="bg-blue-100 rounded-full p-2 flex items-center gap-1.5 w-fit">
                      <User className="w-4 h-4" />
                      <h3 className="text-sm">3 Guests</h3>
                    </div>
                    <div className="bg-blue-100 rounded-full p-2 flex items-center gap-1.5 w-fit">
                      <Square className="w-4 h-4" />
                      <h3 className="text-sm">23 m2</h3>
                    </div>
                  </div>

                  {/* Separate badge below */}
                  <div className="bg-blue-100 rounded-full p-2 flex items-center gap-1.5 w-fit mb-3">
                    <Bed className="w-4 h-4" />
                    <h3 className="text-sm">2 Beds</h3>
                  </div>
                </div>

                <div className="mt-auto">
                  {
                    room.status_id === 3 ?
                      <BookingWaccount rooms={rooms} selectedRoom={room} /> :
                      <Button disabled>Book Now</Button>
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
export default CustomerDashboard