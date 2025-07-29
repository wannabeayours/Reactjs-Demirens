import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bed, BedIcon, Car, CheckCheck, Dumbbell, HandPlatter, Info, MinusIcon, Plus, Square, Star, User, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/layout/LandingHeader';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/ui/date-picker';


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


function Landingpage() {
  const [feedback, setFeedback] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guestNumber, setGuestNumber] = useState(0);

  // const aboutimages = [
  //   { src: './assets/images/beach.png', title: 'Explore the beach', location: 'Boracay, Philippines' },
  //   { src: './assets/images/beach.png', title: 'Relaxing waves', location: 'Siargao, Philippines' },
  //   { src: './assets/images/beach.png', title: 'Sunny shores', location: 'El Nido, Palawan' },
  //   { src: './assets/images/beach.png', title: 'Paradise found', location: 'Camiguin, Philippines' },
  //   { src: './assets/images/beach.png', title: 'Island breeze', location: 'Cebu, Philippines' },
  // ];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn: "",
      checkOut: "",

    },
  })

  const onSubmit = async (data) => {
    localStorage.setItem("checkIn", data.checkIn);
    localStorage.setItem("checkOut", data.checkOut);

  }
  const getFeedbacks = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getFeedbacks");
      const res = await axios.post(url, formData);
      setFeedback(res.data !== 0 ? res.data : []);
      console.log("res ni getFeedbacks", res);

    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }

  const getRooms = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getRooms");
      const res = await axios.post(url, formData);
      console.log("res ni getRooms", res);
      setRooms(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }
  useEffect(() => {
    getFeedbacks();
    getRooms();
  }, []);
  return (

    <div >
      <div
        className="fixed inset-0 bg-[#1A2947] z-0"
      >
      </div>


      <div className="fixed inset-0 bg-black/50 z-10"></div>

      <div className="relative z-20 scroll-smooth">
        <LandingHeader />
        <div className="scroll-smooth  ">


          {/* Section 1 - Welcome */}
          <section className="h-screen flex flex-col">
            {/* Top Half - Image background with heading */}
            <div
              className="h-[150%] bg-fixed  bg-cover bg-center bg-no-repeat flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ backgroundImage: 'url("./assets/images/hotels.jpg")' }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                WELCOME TO DEMIREN HOTEL AND RESTAURANT
              </h1>
            </div>

            {/* Bottom Half - Solid color with form */}
            <div className="h-1/2 bg-[#0D1423] flex items-start justify-center p-6 z-10 relative">

              <Card className="bg-transparent border-none shadow-white w-full max-w-5xl">
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white"
                    >
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
                        <Label className="mb-2">Number of Guests</Label>
                        <div className="flex items-center justify-start space-x-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setGuestNumber(guestNumber - 1)}
                            disabled={guestNumber === 0}
                          >
                            <MinusIcon />
                          </Button>
                          <Input
                            className="w-1/4"
                            type="number"
                            readOnly
                            value={guestNumber}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setGuestNumber(guestNumber + 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-start mt-5">
                        <Button className="w-full bg-[#bba008] hover:bg-yellow-600">Search</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </section>



          {/* Section 2 */}
          <section id="about" className="flex items-center justify-center h-screen w-full bg-[#0D1423]">
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="px-8 text-center text-white">
                <h2 className="text-4xl font-bold mb-4 text-[#bba008]">Demiren Hotel</h2>
                <hr className="border-t-2 border-[#bba008] w-16 mx-auto mb-4" />
                <p className="text-lg max-w-md mx-auto">
                  Showcase the best your property has to offer by highlighting one of your accommodations.
                  Add a flattering photo, then describe the room’s best feature.
                </p>
              </div>
            </div>

            {/* Right Image Side */}
            <div className="w-full md:w-1/2 h-full">
              <img
                src="./assets/images/abouts.jpg"
                alt="Garden Villa"
                className="w-full h-full object-cover rounded-3xl overflow-hidden"
              />
            </div>
          </section>




          {/* Section 3  */}
          <section className="flex items-center justify-center h-screen">
            <div className="w-full max-w-4xl text-center">

              <video
                className="w-full max-w-[500%] rounded-2xl border-4 border-yellow-600 shadow-2xl"
                controls
                autoPlay
                muted
                loop
              >
                <source src="/assets/videos/vi.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>



            </div>
          </section>

          {/* Section 4  */}
          <section className="h-screen p-6 bg-[#0D1423]">
            <div className="w-full h-screen">
              <div className="mt-11 text-center">
                <h1 className="text-2xl font-bold text-[#bba008] inline-bloc px-4 py-2">
                  Our Rooms
                </h1>
                <h3 className='mt-2 text-white'>Choose from our selection of beautifully designed rooms, each offering comfort, style, and convenience.</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-10 p-5">
                {rooms.filter((room) => room.status_id === 3).length === 0 ? (
                  <p>No rooms available</p>
                ) : (
                  rooms
                    .filter((room) => room.status_id === 3)
                    .map((room, index) => (
                      <Card key={index} className="flex flex-col h-full shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-[#F5F7FA]">
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
                              <div className="flex flex-row space-x-2 text-[#0D1423]">
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
                            <h2 className="text-lg font-semibold text-blue-600"> ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
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

                            <Button className="w-full text-lg py-2 bg-[#0D1423] hover:bg-[#3A4455] transition duration-300" disabled={room.status_id !== 3}>Book Now</Button>

                          </div>

                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
              <div className="mt-4 flex items-center justify-center">
                <Link to="/customer/bookings">
                  <Button variant="link">View all rooms <ArrowRight className="w-4 h-4" /></Button>
                </Link>
              </div>

            </div>
          </section>

          {/* Section 5  */}
          <section className="h-screen p-6 bg-[#0D1423]">
            <div className="w-full h-screen">
              <div className="mt-11 text-center">
                <h1 className="text-2xl font-bold text-[#bba008] inline-bloc px-4 py-2 rounded">
                  Hotel Amenities
                </h1>
                <h3 className='mt-2 text-white'>Enjoy our wide range of premuim amenities designed to make your stay comfortable and memorable.  </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-14">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Wifi className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Free WiFi</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <HandPlatter className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Restaurant</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Car className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Free Parking</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-28">

                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
              </div>
            </div>

          </section>


          {/* Section 6  */}
          <section className="h-screen p-6 bg-[#0D1423]">
            <div>
              <div className="mt-11 text-center mb-10">
                <h1 className="text-2xl font-bold text-[#bba008]  inline-bloc px-4 py-2">
                  Guest Testimonials
                </h1>
                <h3 className='mt-2 text-white'>See what our guest have to say about their stay  </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-14">
                {feedback.map((item, index) => (
                  <div key={index}>

                    <div className="border-l-4 border-[#bba008] pl-3">
                      <Card className="shadow-md">

                        <CardHeader >
                          <CardTitle  >{item.customer_fullname}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className=" border-2 border-gray-400 rounded-lg">
                            <p className="text-sm p-3" >{item.customersreviews}</p>
                          </div>
                          <div className="mt-2">
                            <div className="flex">
                              <p> <span>🤝</span>Hospitality: </p>
                              <div className="flex ml-7">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <Star
                                    key={starValue}
                                    className={cn(
                                      "h-6 w-6 cursor-pointer transition-colors",
                                      starValue <= item.customersreviews_hospitality_rate ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                                    )}
                                  />
                                ))}
                              </div>

                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex">
                              <p> <span>🧹</span>Cleanliness: </p>
                              <div className="flex ml-6">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <Star
                                    key={starValue}
                                    className={cn(
                                      "h-6 w-6 cursor-pointer transition-colors",
                                      starValue <= item.customersreviews_cleanliness_rate ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex">
                              <p><span>😊</span>Behavior: </p>
                              <div className="flex ml-10">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <Star
                                    key={starValue}
                                    className={cn(
                                      "h-6 w-6 cursor-pointer transition-colors",
                                      starValue <= item.customersreviews_behavior_rate ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex">
                              <p><span>🏢</span>Facilities: </p>
                              <div className="flex ml-11">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <Star
                                    key={starValue}
                                    className={cn(
                                      "h-6 w-6 cursor-pointer transition-colors",
                                      starValue <= item.customersreviews_facilities_rate ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex">
                              <p><span>🍽️</span>Food: </p>
                              <div className="flex ml-16">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                  <Star
                                    key={starValue}
                                    className={cn(
                                      "h-6 w-6 cursor-pointer transition-colors",
                                      starValue <= item.customersreviews_foods_rate ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>



                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}

              </div>




            </div>
          </section>

          <Footer />

        </div>
      </div>
    </div>

  )
}

export default Landingpage