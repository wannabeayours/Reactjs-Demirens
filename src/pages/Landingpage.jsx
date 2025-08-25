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
      console.log("res ni get rooms", res)

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
          <section id='home' className="p-4 md:p-6  min-h-screen rounded  bg-no-repeat bg-cover bg-fixed"
            style={{ backgroundImage: "url('/assets/images/dems1.png')" }}
          >
            <div className="grid grid-rows-2 gap-10 text-white pt-20 pl-20 md:pt-32 lg:pt-80  ">
              {/* Row 1: Welcome Text */}
              <div className="text-left mt-24 w-full ">
                <h1 className="font-playfair text-5xl md:text-8xl">Welcome to Demerin Hotel</h1>
                <h1 className="font-playfair text-5xl md:text-8xl">& Restaurant</h1>
                <p className="text-xl md:text-xl mt-4">
                  Experience comfort, convenience, and genuine hospitality where your stay feels like home,
                </p>
                <p className="text-xl md:text-xl mt-2">and every moment is made memorable.</p>
              </div>
              <div className=" flex items-start justify-start ">
                <Card className=" w-full max-w-6xl bg-black/70 border-none text-white">
                  <CardContent>
                    <Form {...form}>

                      <form onSubmit={form.handleSubmit(onSubmit)} >
                        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
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
                                  withTime={false}
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
                                  withTime={false}
                                />
                              </FormItem>
                            )}
                          />

                          <div>
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

                          <div>
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
                          <div className="flex items-end ">
                            <Button className="w-full  ">Search</Button>
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
          <section id="about" className="p-6 rounded ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20 ">
              {/* Column 1 */}
              <div className="flex flex-col ">
                {/* Row 1 */}
                <div className=" p-4 rounded h-[80vh]">
                  <img
                    src="/assets/images/dems1.png"
                    alt="image2"
                    className="h-full w-full object-cover rounded-3xl"
                  />
                </div>
                {/* Row 2 */}
                <div className=" p-4 rounded h-[80vh]">
                  <h1 className='text-2xl mt-2'>At Demiren, we don’t just offer a place to stay — we provide a space to relax, dine, and feel genuinely cared for. Our in-house restaurant serves a selection of local and international dishes, prepared with passion and fresh ingredients to satisfy every appetite.
                    From the moment you arrive to the time you leave, we aim to make your stay smooth, restful, and enjoyable.</h1>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col ">
                {/* Row 1 */}
                <div className=" p-4 rounded h-[80vh] flex flex-col justify-center items-start">
                  <h1 className='font-playfair text-5xl'>ABOUT</h1>
                  <h1 className='text-2xl mt-2'>Welcome to Demiren Hotel & your trusted home away from home. Nestled in a convenient location, we combine modern comfort with warm, personalized hospitality to give every guest a memorable experience. Whether you're staying for business, leisure, or a family getaway, our well-appointed rooms, exceptional service, and inviting atmosphere are designed to meet your every need.</h1>
                </div>
                {/* Row 2 */}
                <div className=" p-4 rounded h-[80vh]">
                  <img
                    src="/assets/images/dems1.png"
                    alt="image2"
                    className="h-full w-full object-cover rounded-3xl"
                  />
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
                              className="flex-shrink-0 w-1/6 bg-[#F0F0FF] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out h-[600px] hover:scale-105"
                            >
                              {/* Image Section */}
                              <div className="h-[30vh] w-full overflow-hidden">
                                <img src={room.image_url} alt="Room" className="w-full h-full object-cover" />
                              </div>

                              {/* Info Section */}
                              <div className="flex flex-col p-4 flex-1">
                                <h5 className="text-2xl font-semibold mb-2">{room.roomtype_name}</h5>
                                <p
                                  className="text-sm text-gray-600 mb-4 overflow-hidden"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {room.roomtype_description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                  <h2 className="text-xl font-bold text-blue-600 flex items-center gap-1">
                                    ₱ {Number(room.roomtype_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}/night
                                    <Moon size={20} />
                                  </h2>
                                  <div className="flex gap-2">
                                    <Badge className="bg-transparent border-blue-500 text-blue-500">{room.room_sizes}</Badge>
                                    <Badge className="bg-transparent border-blue-500 text-blue-500">
                                      {room.room_capacity}
                                      <User size={20} className="ml-1" />
                                    </Badge>
                                    <Badge className="bg-transparent border-blue-500 text-blue-500">
                                      {room.room_beds}
                                      <BedDoubleIcon size={20} className="ml-1" />
                                    </Badge>
                                  </div>
                                </div>

                                <div className="mt-auto">
                                  <Button
                                    variant="link"
                                    className="w-full justify-start"
                                    onClick={() => handleNextPage(room)}
                                  >
                                    View Room →
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



          <section id="contact" className="rounded h-screen border-none grid grid-cols-1 md:grid-cols-2  flex-1 w-full   ">
            {/* Left Column */}
            <div className="flex flex-col gap-4 p-4  mt-20 ">
              <div className="mt-8 text-5xl">
                <h1 className='font-playfair text-5xl'>Have Questions?</h1>
              </div>
              <div className="text-5xl ">
                <h1 className='font-playfair text-5xl'>We've Got a Answers!</h1>
              </div>

              <div className="gap-4 p-2 mt-16 w-[90%] space-x-4  space-y-4 mb-6">
                <Form {...contactform}>
                  <form onSubmit={contactform.handleSubmit(onContactSubmit)} >
                    <FormField
                      control={contactform.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactform.control}
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
                    <FormField
                      control={contactform.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your message" {...field} className="min-h-[160px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-6">Submit</Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 p-4 mt-20  ">
              <div className="mt-8 text-lg  ">
                <h1>
                  Find everything you need to know about your stay at Demiren Hotel & Restaurant.
                  From check-in details to exclusive experiences, we’ve covered it all!
                </h1>
              </div>
              <div className=" p-4 rounded h-[70vh]">
                <img
                  src="/assets/images/dems1.png"
                  alt="image2"
                  className="h-full w-full object-cover rounded-3xl"
                />
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