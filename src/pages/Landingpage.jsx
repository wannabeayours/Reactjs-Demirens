import LandingHeader from '@/components/layout/LandingHeader'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BedDoubleIcon, ChevronLeftCircleIcon, LucideCircleChevronRight, MinusIcon, Moon, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import DatePicker from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';




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
  const [rooms, setRooms] = useState([]);
  const [adultNumber, setAdultNumber] = useState(0);
  const [childrenNumber, setChildrenNumber] = useState(0);
  const [isSearched, setIsSearched] = useState(false);

  const navigateTo = useNavigate();




  const handleNextPage = (roomDetails) => {
    sessionStorage.setItem('viewRoomDetails', JSON.stringify(roomDetails));
    navigateTo('/customer/roomview');
  }



  const scroll = (scrollOffset) => {
    if (scroll.current) {
      scroll.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth',
      });
    }
  };

  const contactform = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })


  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn: "",
      checkOut: "",
      adults: "1",
      children: "0",

    },
  })

  const getRooms = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getRooms");
      const res = await axios.post(url, formData);
      console.log("res ni get roomssss", res)

      // Ensure rooms is always an array
      const data = Array.isArray(res.data) ? res.data : [];
      setRooms(data);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
      setRooms([]); // fallback
    }
  }


  const handleClearData = () => {
    localStorage.removeItem("checkIn");
    localStorage.removeItem("checkOut");
    localStorage.removeItem("guestNumber");
    localStorage.removeItem("children");
    localStorage.removeItem("adult");
    setIsSearched(false);
  }


  const onSubmit = async (data) => {
    localStorage.setItem("checkIn", data.checkIn);
    localStorage.setItem("checkOut", data.checkOut);
    localStorage.setItem("children", childrenNumber);
    localStorage.setItem("adult", adultNumber);
    localStorage.setItem("guestNumber", Number(adultNumber) + Number(childrenNumber));
    console.log("mga data sa pag search", data);
    getRooms(data);
    setIsSearched(true);
    navigateTo("/customer/roomsearch");
  }

  const onContactSubmit = async (data) => {
    try {
      console.log("Contact form submitted", data);
      toast.success("Message sent successfully!");
      contactform.reset();
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };


  useEffect(() => {

    getRooms();
  }, []);









  return (
    <>

      <div className="flex flex-col min-h-screen ">

        {/* Header */}

        <div className="sticky top-0 z-50">
          <LandingHeader />
        </div>

        {/* Content (This will occupy all remaining space) */}
        <main className="flex-1 bg-white flex flex-col min-h-screen ">

          {/* Section 1 */}
          <section id='home' className="p-4 md:p-6 min-h-screen rounded bg-no-repeat bg-cover bg-fixed relative overflow-hidden"
            style={{ backgroundImage: "url('/assets/images/dems1.png')" }}
          >
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
            <div className="grid grid-rows-2 gap-10 text-white pt-20 pl-4 md:pl-20 md:pt-32 lg:pt-80 relative z-20">
              {/* Row 1: Welcome Text */}
              <div className="text-left  w-full animate-fadeIn">
                <h1 className="font-playfair text-5xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 animate-slideInLeft">Welcome to Demerin Hotel</h1>
                <h1 className="font-playfair text-5xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 animate-slideInRight">& Restaurant</h1>
                <p className="text-xl md:text-xl mt-4 animate-fadeIn  animation-delay-300">
                  Experience comfort, convenience, and genuine hospitality where your stay feels like home,
                </p>
                <p className="text-xl md:text-xl mt-2 animate-fadeIn opacity-0 animation-delay-500">and every moment is made memorable.</p>
              </div>
              <div className=" flex items-start justify-start ">
                <Card className=" w-full max-w-6xl bg-black/70 border-none text-white animate-fadeIn">
                  <CardContent>
                    <Form {...form}>

                      <form onSubmit={form.handleSubmit(onSubmit)} >
                        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                          <FormField
                            control={form.control}
                            name="checkIn"
                            render={({ field }) => (
                              <FormItem className="animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                                <FormLabel>Check-In</FormLabel>
                                <div className='text-black'>
                                  <DatePicker
                                    form={form}
                                    name={field.name}
                                    label=""
                                    pastAllowed={false}
                                    futureAllowed={true}
                                    withTime={false}
                                  />
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="checkOut"
                            render={({ field }) => (
                              <FormItem className="animate-slideInLeft" style={{ animationDelay: '200ms' }}>
                                <FormLabel>Check-out</FormLabel>
                                <div className='text-black'>
                                  <DatePicker
                                    form={form}
                                    name={field.name}
                                    label=""
                                    pastAllowed={false}
                                    futureAllowed={true}
                                    withTime={false}
                                  />
                                </div>
                              </FormItem>
                            )}
                          />

                          <div className="animate-slideInRight" style={{ animationDelay: '200ms' }}>
                            <Label className={"mb-2 "}>Adults</Label>
                            <div className="flex items-center justify-start space-x-2">

                              <Button type="button" variant="outline" onClick={() => setAdultNumber(adultNumber - 1)} disabled={adultNumber === 0}><MinusIcon className="text-black" /></Button>
                              <Input
                                className="w-1/4"
                                type="number"
                                readOnly
                                value={adultNumber}
                              />
                              <Button type="button" variant="outline" onClick={() => setAdultNumber(adultNumber + 1)}><Plus className="text-black" /></Button>

                            </div>
                          </div>

                          <div className="animate-slideInRight" style={{ animationDelay: '100ms' }}>
                            <Label className={"mb-2 "}>Children</Label>
                            <div className="flex items-center justify-start space-x-2">

                              <Button type="button" variant="outline" onClick={() => setChildrenNumber(childrenNumber - 1)} disabled={childrenNumber === 0}><MinusIcon className="text-black" /></Button>
                              <Input
                                className="w-1/4"
                                type="number"
                                readOnly
                                value={childrenNumber}
                              />
                              <Button type="button" variant="outline" onClick={() => setChildrenNumber(childrenNumber + 1)}><Plus className="text-black" /></Button>
                            </div>
                          </div>
                          <div className="flex items-end animate-fadeIn" style={{ animationDelay: '300ms' }}>
                            <Button className="w-full transform hover:scale-105 transition-all duration-300">Search</Button>
                          </div>
                        </div>



                      </form>

                    </Form>
                  </CardContent>

                </Card>
              </div>



            </div>


          </section>

          {/* Section 2 */}
          <section id="about" className="py-20 px-6 rounded overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-fadeIn mt-14">
                <h2 className="text-6xl font-playfair mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-purple-800">ABOUT US</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Column */}
                <div className="flex flex-col space-y-8 animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                  {/* Image with overlay */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[60vh] transform transition-transform duration-700 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src="/assets/images/dems1.png"
                      alt="Demiren Hotel Exterior"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                      <h3 className="text-3xl font-playfair text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Luxury & Comfort</h3>
                      <p className="text-white/90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">Experience the perfect blend of elegance and comfort</p>
                    </div>
                  </div>

                  {/* Text block */}
                  <div className="bg-blue-50 p-8 rounded-3xl shadow-lg transform hover:shadow-xl transition-all duration-300 hover:bg-blue-100/70">
                    <h3 className="text-2xl font-semibold text-blue-800 mb-4">Our Promise</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      At Demiren, we don't just offer a place to stay — we provide a space to relax, dine, and feel genuinely cared for. Our in-house restaurant serves a selection of local and international dishes, prepared with passion and fresh ingredients to satisfy every appetite.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mt-4">
                      From the moment you arrive to the time you leave, we aim to make your stay smooth, restful, and enjoyable.
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col space-y-8 animate-slideInRight" style={{ animationDelay: '200ms' }}>
                  {/* Text block */}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl shadow-lg text-white transform hover:shadow-xl transition-all duration-300">
                    <h3 className="text-3xl font-playfair mb-6">Welcome Home</h3>
                    <p className="text-lg leading-relaxed">
                      Welcome to Demiren Hotel & your trusted home away from home. Nestled in a convenient location, we combine modern comfort with warm, personalized hospitality to give every guest a memorable experience.
                    </p>
                    <p className="text-lg leading-relaxed mt-4">
                      Whether you're staying for business, leisure, or a family getaway, our well-appointed rooms, exceptional service, and inviting atmosphere are designed to meet your every need.
                    </p>
                    <div className="mt-6 flex space-x-4">
                      <Badge className="bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white px-4 py-2">Exceptional Service</Badge>
                      <Badge className="bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white px-4 py-2">Premium Comfort</Badge>
                    </div>
                  </div>

                  {/* Image with overlay */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[60vh] transform transition-transform duration-700 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src="/assets/images/dems1.png"
                      alt="Demiren Hotel Interior"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                      <h3 className="text-3xl font-playfair text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Memorable Experiences</h3>
                      <p className="text-white/90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">Creating moments that last a lifetime</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Section 3 */}
          <div className="flex-1 w-full   ">
            <section className=" p-6 rounded min-h-[100vh]">
              <div className="mt-16">
                <h1 className='font-playfair text-5xl'>ROOM TYPES</h1>
              </div>
              <div className="mt-6 text-2xl">
                <h1>Discover elegant spaces crafted for relaxation, style, and a restful night's sleep.</h1>
              </div>
              {/* Arrows */}

              <div className="mt-16">
                <div className="relative w-full">
                  <div className="flex justify-end mb-4 px-4 gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => scroll(-300)}
                      className="p-2 rounded-full transition flex items-center justify-center"
                    >
                      <ChevronLeftCircleIcon size={62} />
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => scroll(300)}
                      className="p-2 rounded-full transition flex items-center justify-center"
                    >
                      <LucideCircleChevronRight size={62} />
                    </Button>
                  </div>

                  <ScrollArea className="w-full overflow-x-auto">
                    <div ref={scroll} className="flex flex-nowrap space-x-4 px-4 py-6">
                      {rooms.filter((room) => room.status_id === 3).length === 0 ? (
                        <p>No rooms available</p>
                      ) : (
                        rooms
                          .filter((room) => room.status_id === 3)
                          .map((room, index) => (
                            <Card
                              key={index}
                              className="flex-shrink-0 w-1/6 bg-gradient-to-b from-white to-[#F0F0FF] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out h-[600px] hover:scale-105 border border-blue-100 group animate-fadeIn"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              {/* Image Section */}
                              <div className="h-[30vh] w-full overflow-hidden rounded-t-2xl relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                                <img
                                  src={localStorage.getItem("url") + "images/" + room.roomtype_image}
                                  // src={room.image_url} 
                                  alt="Room"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-2 right-2 z-20">
                                  <Badge className="bg-blue-600 text-white font-semibold px-3 py-1 shadow-lg">
                                    Available
                                  </Badge>
                                </div>
                              </div>

                              {/* Info Section */}
                              <div className="flex flex-col p-5 flex-1">
                                <h5 className="text-2xl font-semibold mb-2 text-blue-800 group-hover:text-blue-600 transition-colors duration-300">{room.roomtype_name}</h5>
                                <p
                                  className="text-sm text-gray-600 mb-4 overflow-hidden group-hover:text-gray-800 transition-colors duration-300"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {room.roomtype_description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                  <h2 className="text-xl font-bold text-blue-700 flex items-center gap-1 animate-fadeIn">
                                    ₱ {Number(room.roomtype_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                    <span className="text-sm font-normal text-gray-500">/night</span>
                                  </h2>
                                  <div className="flex gap-2">
                                    <Badge className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors duration-300">{room.room_sizes}</Badge>
                                    <Badge className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors duration-300">
                                      {room.room_capacity}
                                      <User size={20} className="ml-1" />
                                    </Badge>
                                    <Badge className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors duration-300">
                                      {room.room_beds}
                                      <BedDoubleIcon size={20} className="ml-1" />
                                    </Badge>
                                  </div>
                                </div>

                                <div className="mt-auto">
                                  <Button
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group"
                                    onClick={() => handleNextPage(room)}
                                  >
                                    <span className="group-hover:mr-2 transition-all duration-300">View Room</span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>


                </div>
              </div>
            </section>

          </div>



          <section id="contact" className="py-20 px-6 rounded overflow-hidden bg-gradient-to-b from-white to-blue-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-fadeIn mt-14">
                <h2 className="text-6xl font-playfair mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-800">CONTACT US</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left Column - Contact Form */}
                <div className="flex flex-col space-y-6 animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                  <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-blue-100">
                    <h3 className="text-3xl font-playfair mb-6 text-blue-800">Have Questions?</h3>
                    <h4 className="text-2xl font-playfair mb-8 text-indigo-700">We've Got Answers!</h4>

                    <Form {...contactform}>
                      <form onSubmit={contactform.handleSubmit(onContactSubmit)} className="space-y-6">
                        <FormField
                          control={contactform.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="text-blue-700 font-medium">Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Enter your name"
                                    {...field}
                                    className="pl-10 border-blue-200 focus:border-blue-500 rounded-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-200"
                                  />
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-300" size={18} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactform.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="text-blue-700 font-medium">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Enter your email"
                                    {...field}
                                    className="pl-10 border-blue-200 focus:border-blue-500 rounded-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-200"
                                  />
                                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactform.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="text-blue-700 font-medium">Message</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <textarea
                                    placeholder="Enter your message"
                                    {...field}
                                    className="w-full min-h-[160px] pl-10 border border-blue-200 focus:border-blue-500 rounded-lg py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-200"
                                  />
                                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-8 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group"
                        >
                          <span className="group-hover:mr-2 transition-all duration-300">Send Message</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>

                {/* Right Column - Image and Text */}
                <div className="flex flex-col space-y-8 animate-slideInRight" style={{ animationDelay: '200ms' }}>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white transform hover:shadow-xl transition-all duration-300">
                    <h3 className="text-3xl font-playfair mb-6">Get In Touch</h3>
                    <p className="text-lg leading-relaxed">
                      Find everything you need to know about your stay at Demiren Hotel & Restaurant.
                      From check-in details to exclusive experiences, we've covered it all!
                    </p>
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        </div>
                        <span>+63 123 456 7890</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        </div>
                        <span>info@demirenhotel.com</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <span>123 Hotel Street, City, Country</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[50vh] transform transition-transform duration-700 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src="/assets/images/dems1.png"
                      alt="Demiren Hotel Contact"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                      <h3 className="text-3xl font-playfair text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Visit Us Today</h3>
                      <p className="text-white/90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">Experience our exceptional hospitality in person</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main >


        {/* Footer */}
        < footer >
          <Footer />
        </footer >
      </div >
    </>



  )
}

export default Landingpage