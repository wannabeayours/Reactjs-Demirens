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
  const [adultNumber, setAdultNumber] = useState(1);
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
      checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
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

          {/* Section 1 - Enhanced Hero Section */}
          <section id='home' className="relative p-4 md:p-6 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden"
            style={{ 
              backgroundImage: "linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(67, 56, 202, 0.8) 50%, rgba(29, 78, 216, 0.9) 100%), url('/assets/images/dems1.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          >
            {/* Enhanced gradient overlay with animated particles effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-800/60 to-blue-900/80 z-10"></div>
            
            {/* Floating geometric shapes for modern design */}
            <div className="absolute inset-0 overflow-hidden z-5">
              <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-indigo-400/15 to-blue-500/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-300/25 to-indigo-400/25 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="grid grid-rows-2 gap-12 text-white pt-20 pl-4 md:pl-20 md:pt-32 lg:pt-80 relative z-20">
              {/* Row 1: Enhanced Welcome Text */}
              <div className="text-left w-full animate-fadeIn">
                <div className="mb-6">
                  <h1 className="font-playfair text-5xl md:text-8xl lg:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200 animate-slideInLeft drop-shadow-2xl">
                    Welcome to Demerin Hotel
                  </h1>
                  <h1 className="font-playfair text-5xl md:text-8xl lg:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-white to-blue-200 animate-slideInRight drop-shadow-2xl">
                    & Restaurant
                  </h1>
                </div>
                <div className="max-w-4xl">
                  <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed animate-fadeIn animation-delay-300 text-blue-50 drop-shadow-lg">
                    Experience comfort, convenience, and genuine hospitality where your stay feels like home,
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mt-2 animate-fadeIn opacity-0 animation-delay-500 text-blue-100 drop-shadow-lg">
                    and every moment is made memorable.
                  </p>
                </div>
                
                {/* Enhanced call-to-action badges */}
                <div className="flex flex-wrap gap-4 mt-8 animate-fadeIn animation-delay-700">
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 backdrop-blur-sm rounded-full border border-blue-300/30">
                    <span className="text-blue-100 font-medium">✨ Luxury Accommodations</span>
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 backdrop-blur-sm rounded-full border border-indigo-300/30">
                    <span className="text-blue-100 font-medium">🍽️ Fine Dining Experience</span>
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-sm rounded-full border border-blue-400/30">
                    <span className="text-blue-100 font-medium">🌟 Premium Service</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Booking Form */}
              <div className="flex items-start justify-start">
                <Card className="w-full max-w-6xl bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-lg border-0 shadow-2xl animate-fadeIn rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-3xl"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                        Find Your Perfect Stay
                      </h3>
                      <p className="text-gray-600 text-lg">Book your dream accommodation with us</p>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                          <FormField
                            control={form.control}
                            name="checkIn"
                            render={({ field }) => (
                              <FormItem className="animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                                <FormLabel className="text-blue-800 font-semibold text-base">Check-In Date</FormLabel>
                                <div className="relative">
                                  <DatePicker
                                    form={form}
                                    name={field.name}
                                    label=""
                                    pastAllowed={false}
                                    futureAllowed={true}
                                    withTime={false}
                                  />
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="checkOut"
                            render={({ field }) => (
                              <FormItem className="animate-slideInLeft" style={{ animationDelay: '200ms' }}>
                                <FormLabel className="text-blue-800 font-semibold text-base">Check-Out Date</FormLabel>
                                <div className="relative">
                                  <DatePicker
                                    form={form}
                                    name={field.name}
                                    label=""
                                    pastAllowed={false}
                                    futureAllowed={true}
                                    withTime={false}
                                  />
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
                                </div>
                              </FormItem>
                            )}
                          />

                          <div className="animate-slideInRight" style={{ animationDelay: '200ms' }}>
                            <Label className="text-blue-800 font-semibold text-base mb-3 block">Adults</Label>
                            <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200/50">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setAdultNumber(adultNumber - 1)} 
                                disabled={adultNumber === 0}
                                className="h-10 w-10 rounded-full border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all duration-300"
                              >
                                <MinusIcon className="text-blue-600 h-4 w-4" />
                              </Button>
                              <Input
                                className="w-16 text-center border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 font-semibold text-blue-800"
                                type="number"
                                readOnly
                                value={adultNumber}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setAdultNumber(adultNumber + 1)}
                                className="h-10 w-10 rounded-full border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all duration-300"
                              >
                                <Plus className="text-blue-600 h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="animate-slideInRight" style={{ animationDelay: '100ms' }}>
                            <Label className="text-blue-800 font-semibold text-base mb-3 block">Children</Label>
                            <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200/50">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setChildrenNumber(childrenNumber - 1)} 
                                disabled={childrenNumber === 0}
                                className="h-10 w-10 rounded-full border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all duration-300"
                              >
                                <MinusIcon className="text-blue-600 h-4 w-4" />
                              </Button>
                              <Input
                                className="w-16 text-center border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 font-semibold text-blue-800"
                                type="number"
                                readOnly
                                value={childrenNumber}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setChildrenNumber(childrenNumber + 1)}
                                className="h-10 w-10 rounded-full border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all duration-300"
                              >
                                <Plus className="text-blue-600 h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-end animate-fadeIn" style={{ animationDelay: '300ms' }}>
                            <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0">
                              <span className="flex items-center gap-2">
                                🔍 Search Rooms
                              </span>
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>



            {/* Section 2 - Enhanced About Section */}
            <section id="about" className="py-20 px-6 rounded overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fadeIn mt-14">
                  <h2 className="text-6xl font-playfair mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 drop-shadow-sm">ABOUT US</h2>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 mx-auto rounded-full shadow-lg"></div>
                  <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">Discover the story behind our commitment to exceptional hospitality and unforgettable experiences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  {/* Left Column */}
                  <div className="flex flex-col space-y-8 animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                    {/* Enhanced Image with overlay */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[60vh] transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-indigo-800/30 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <img
                        src="/assets/images/dems1.png"
                        alt="Demiren Hotel Exterior"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                        <h3 className="text-3xl font-playfair text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-lg">Luxury & Comfort</h3>
                        <p className="text-blue-100 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100 drop-shadow-md">Experience the perfect blend of elegance and comfort</p>
                      </div>
                      {/* Decorative corner accent */}
                      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Enhanced Text block */}
                    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-blue-100/50 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-white text-xl">🤝</span>
                          </div>
                          <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">Our Promise</h3>
                        </div>
                        <p className="text-lg text-gray-700 leading-relaxed mb-4">
                          At Demiren, we don't just offer a place to stay — we provide a space to relax, dine, and feel genuinely cared for. Our in-house restaurant serves a selection of local and international dishes, prepared with passion and fresh ingredients to satisfy every appetite.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          From the moment you arrive to the time you leave, we aim to make your stay smooth, restful, and enjoyable.
                        </p>
                        <div className="mt-6 flex space-x-3">
                          <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                            <span className="text-blue-700 font-medium text-sm">✨ Premium Quality</span>
                          </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full border border-indigo-200">
                            <span className="text-indigo-700 font-medium text-sm">🍽️ Fine Dining</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col space-y-8 animate-slideInRight" style={{ animationDelay: '200ms' }}>
                    {/* Enhanced Text block */}
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white transform hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                            <span className="text-white text-xl">🏠</span>
                          </div>
                          <h3 className="text-3xl font-playfair">Welcome Home</h3>
                        </div>
                        <p className="text-lg leading-relaxed text-blue-50 mb-4">
                          Welcome to Demiren Hotel & your trusted home away from home. Nestled in a convenient location, we combine modern comfort with warm, personalized hospitality to give every guest a memorable experience.
                        </p>
                        <p className="text-lg leading-relaxed text-blue-100">
                          Whether you're staying for business, leisure, or a family getaway, our well-appointed rooms, exceptional service, and inviting atmosphere are designed to meet your every need.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                          <Badge className="bg-white/20 hover:bg-white/30 transition-all duration-300 text-white px-4 py-2 backdrop-blur-sm border border-white/20">
                            ⭐ Exceptional Service
                          </Badge>
                          <Badge className="bg-white/20 hover:bg-white/30 transition-all duration-300 text-white px-4 py-2 backdrop-blur-sm border border-white/20">
                            🛏️ Premium Comfort
                          </Badge>
                          <Badge className="bg-white/20 hover:bg-white/30 transition-all duration-300 text-white px-4 py-2 backdrop-blur-sm border border-white/20">
                            📍 Prime Location
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Image with overlay */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[60vh] transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-blue-800/30 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <img
                        src="/assets/images/dems1.png"
                        alt="Demiren Hotel Interior"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                        <h3 className="text-3xl font-playfair text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-lg">Memorable Experiences</h3>
                        <p className="text-blue-100 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100 drop-shadow-md">Creating moments that last a lifetime</p>
                      </div>
                      {/* Decorative corner accent */}
                      <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-indigo-400/30 to-blue-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            {/* Section 3 - Enhanced Room Types Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-indigo-50/50 via-white to-blue-50/30 min-h-screen">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fadeIn">
                  <h2 className="text-6xl font-playfair mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 drop-shadow-sm">ROOM TYPES</h2>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 mx-auto rounded-full shadow-lg"></div>
                  <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto">Discover elegant spaces crafted for relaxation, style, and a restful night's sleep. Each room is thoughtfully designed to provide the perfect blend of comfort and luxury.</p>
                </div>

                {/* Enhanced Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 px-4">
                  {rooms.filter((room) => room.status_id === 3).length === 0 ? (
                    <div className="col-span-full text-center py-20">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 shadow-lg border border-blue-100 max-w-md mx-auto">
                        <div className="w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <span className="text-white text-3xl">🏨</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-blue-800 mb-4">No Rooms Available</h3>
                        <p className="text-gray-600 text-lg">Please check back later for available accommodations.</p>
                      </div>
                    </div>
                  ) : (
                    rooms
                      .filter((room) => room.status_id === 3)
                      .map((room, index) => (
                          <Card
                            key={index}
                            className="w-full bg-gradient-to-b from-white via-blue-50/20 to-indigo-50/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 ease-in-out hover:scale-105 border border-blue-100/50 group animate-fadeIn relative overflow-hidden"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                            
                            {/* Enhanced Image Section */}
                            <div className="h-64 w-full overflow-hidden rounded-t-3xl relative">
                              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-indigo-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                              <img
                                src={localStorage.getItem("url") + "images/" + room.roomtype_image}
                                alt={room.roomtype_name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              
                              {/* Enhanced Status Badge */}
                              <div className="absolute top-4 right-4 z-20">
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-4 py-2 shadow-lg backdrop-blur-sm border border-green-400/30 rounded-full">
                                  ✨ Available
                                </Badge>
                              </div>
                              
                              {/* Price Badge */}
                              <div className="absolute top-4 left-4 z-20">
                                <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/30">
                                  <span className="text-white font-bold text-lg">
                                    ₱{Number(room.roomtype_price).toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                                  </span>
                                  <span className="text-blue-100 text-sm ml-1">/night</span>
                                </div>
                              </div>

                              {/* Hover overlay with room features */}
                              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <div className="bg-gradient-to-t from-blue-900/95 to-blue-800/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30">
                                  <h4 className="text-white font-semibold text-lg mb-2">Room Highlights</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-blue-100 text-sm">🛏️ {room.room_beds} Bed{room.room_beds > 1 ? 's' : ''}</span>
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-blue-100 text-sm">👥 {room.room_capacity} Guests</span>
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-blue-100 text-sm">📐 {room.room_sizes}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Info Section */}
                            <div className="flex flex-col p-6 flex-1 relative z-10">
                              <div className="mb-4">
                                <h5 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                                  {room.roomtype_name}
                                </h5>
                                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 line-clamp-3 text-base">
                                  {room.roomtype_description}
                                </p>
                              </div>

                              {/* Enhanced Room Features */}
                              <div className="mb-6">
                                <h6 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Room Features</h6>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 group-hover:shadow-md transition-all duration-300">
                                    <BedDoubleIcon size={24} className="text-blue-600 mx-auto mb-2" />
                                    <span className="text-xs text-blue-700 font-medium">{room.room_beds} Bed{room.room_beds > 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 group-hover:shadow-md transition-all duration-300">
                                    <User size={24} className="text-indigo-600 mx-auto mb-2" />
                                    <span className="text-xs text-indigo-700 font-medium">{room.room_capacity} Guest{room.room_capacity > 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 group-hover:shadow-md transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mx-auto mb-2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
                                    <span className="text-xs text-blue-700 font-medium">{room.room_sizes}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Pricing Section */}
                              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border border-blue-100/50">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm text-gray-500 block">Starting from</span>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                      ₱{Number(room.roomtype_price).toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-1">/night</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">💎</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Action Button */}
                              <div className="mt-auto">
                                <Button
                                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-semibold text-lg rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl group relative overflow-hidden"
                                  onClick={() => handleNextPage(room)}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <span className="relative z-10 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300">
                                    <span>View Details</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                  )}
                </div>
              </div>
            </section>



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


// Add custom CSS animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-left {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fade-in-right {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fade-in-left 0.8s ease-out forwards;
  }

  .animate-fade-in-right {
    animation: fade-in-right 0.8s ease-out forwards;
  }

  .delay-100 {
    animation-delay: 0.1s;
  }

  .delay-200 {
    animation-delay: 0.2s;
  }

  .delay-400 {
    animation-delay: 0.4s;
  }

  .delay-500 {
    animation-delay: 0.5s;
  }

  .delay-600 {
    animation-delay: 0.6s;
  }

  .delay-800 {
    animation-delay: 0.8s;
  }

  .delay-1000 {
    animation-delay: 1s;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}