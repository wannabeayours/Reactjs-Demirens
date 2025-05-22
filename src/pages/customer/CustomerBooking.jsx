import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { ArrowBigRight, PlusIcon } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardTitle } from '@/components/ui/card'
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

const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  contactNumber: z.string().min(1, { message: "Contact number is required" }),
})








function CustomerBooking() {
  const [rooms, setRooms] = useState([]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
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

  useEffect(() => {
    getRooms();
  }, []);




  return (
    <>


      <section className="flex items-center justify-center h-[50vh] bg-gray-100">
        <h1 className="text-2xl font-bold text-center">DIIRI TONG CHECK IN CHECK OUT</h1>
      </section>

      <section className="flex flex-col gap-4 items-center justify-center py-10 px-4 md:px-0 bg-[#D6E6F2]">
        {rooms.length === 0 ? <p>No rooms available</p> : rooms.map((room, index) => (

          <Card className="flex flex-col md:flex-row w-full max-w-5xl p-6 gap-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {/* Carousel */}
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
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{room.roomtype_name}</h2>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant={room.status_id === 3 ? "default" : "destructive"} >{room.status_name}</Badge>
                  </div>
                </div>

                <Drawer>
                  <DrawerTrigger>
                    <Button variant="link">More Info
                      <ArrowBigRight className="ml-2" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="w-full bg-[#D6E6F2]">
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
                          <h2 className="text-xl font-semibold">{room.roomtype_name}</h2>
                        </div>
                        <div className="ml-6">
                          <p className="text-gray-600 mt-1 mb-4">{room.roomtype_description}</p>
                        </div>
                        <div className='ml-6'>
                          <h3>
                            <span className="font-semibold">Capacity:</span>
                          </h3>
                        </div>
                        <div className='ml-6 mt-6'>
                          <h3>
                            <span className="font-semibold">₱ {room.roomtype_price}</span>
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
                  <p className="text-sm text-gray-600">₱ {room.roomtype_price}/ per night</p>
                </div>
                <div className="text-right">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="w-full text-lg py-2" disabled={room.status_id !== 3}>
                        Book Now
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <div className='flex flex-row justify-center'>

                        <div >
                          <Card className="w-full  p-6 space-y-2 mt-10">
                            <CardTitle>Guest Details</CardTitle>

                            <Form {...form}>
                              <form className="space-y-4">

                                <div className="flex space-x-4">
                                  {/* First Name */}
                                  <FormField
                                    control={form.control}
                                    name="firstName"
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

                                  {/* Last Name */}
                                  <FormField
                                    control={form.control}
                                    name="lastName"
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

                                <div className="flex space-x-4">
                                  {/* Email */}
                                  <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                          <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  {/* Contact Number */}
                                  <FormField
                                    control={form.control}
                                    name="contactNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Contact Number</FormLabel>
                                        <FormControl>
                                          <Input placeholder="+63" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                </div>

                              </form>
                            </Form>

                          </Card>
                          <Card className="w-full max-w-lg p-6 space-y-2 mt-4">
                            <CardTitle>Payment Method</CardTitle>

                            <CardContent>
                              <div>
                               pilianan unsa na method
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
                              dere kau booking details 
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
          </Card>
        ))}
      </section>
    </>
  )
}

export default CustomerBooking