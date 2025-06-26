import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bed, BedIcon, Car, CheckCheck, Dumbbell, HandPlatter, Info, Square, Star, User, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/layout/LandingHeader';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';


function Landingpage() {
  const [feedback, setFeedback] = useState([]);
  const [rooms, setRooms] = useState([]);

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
      setRooms(res.data !== 0 ? res.data : {});
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

    <div className="relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url("./assets/images/beach.png")' }}
      ></div>


      <div className="fixed inset-0 bg-black/50 z-10"></div>

      <div className="relative z-20 scroll-smooth">
        <LandingHeader />
        <div className="scroll-smooth  ">


          {/* Section 1 - Welcome */}
          <section className="flex items-center justify-center  w-full  h-screen ">
            <h1 className="text-5xl font-bold ">
              WELCOME TO DEMIREN HOTEL AND RESTAURANT
            </h1>
          </section>

          {/* Section 2  */}
          <section id="about" className="flex items-center justify-center h-screen w-full bg-[#769FCD]">
            <div className="flex w-11/12 max-w-7xl mx-auto flex-col md:flex-row items-center">

              <div className="w-full md:w-1/2 flex  justify-center  mb-8 md:mb-0">
                <img
                  src=""
                  alt="About"
                  className="w-full max-w-sm rounded-lg shadow-lg"
                />
              </div>


              <div className="w-full md:w-1/2 px-4 text-white text-center md:text-left">
                <h2 className="text-4xl font-bold mb-4">Hotel Demiren and Restaurant</h2>
                <p className="text-lg leading-relaxed">
                  We are passionate about delivering high-quality solutions. Our team is dedicated to creating
                  engaging digital experiences that leave a lasting impression.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-col-span-2">
                  <div className="p-4 mt-5">
                    <ul>
                      <li className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        <span>asa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        <span>asa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        <span>asa</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 mt-5">
                    <ul>
                      <li className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        <span>asa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        <span>asa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        <span>asa</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </section>
          {/* Section 3  */}
          <section className="flex items-center justify-center h-screen">
            <div className="w-full max-w-4xl">
              <h2 className="text-3xl font-bold mb-4">Video</h2>

            </div>
          </section>
          {/* Section 4  */}
          <section className="h-screen p-6 bg-white">
            <div className="w-full h-screen">
              <div className="mt-11 text-center">
                <h1 className="text-2xl font-bold text-black inline-bloc px-4 py-2">
                  Our Rooms
                </h1>
                <h3 className='mt-2'>Choose from our selection of beautifully designed rooms, each offering comfort, style, and convenience.</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-10 p-5">
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

                        <Button className="w-full text-lg py-2" disabled={room.status_id !== 3}>Book Now</Button>

                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center">
                <Link to="/customer/bookings">
                  <Button variant="link">View all rooms <ArrowRight className="w-4 h-4" /></Button>
                </Link>
              </div>

            </div>
          </section>

          {/* Section 5  */}
          <section className="h-screen p-6 bg-white">
            <div className="w-full h-screen">
              <div className="mt-11 text-center">
                <h1 className="text-2xl font-bold text-black inline-bloc px-4 py-2 rounded">
                  Hotel Amenities
                </h1>
                <h3 className='mt-2'>Enjoy our wide range of premuim amenities designed to make your stay comfortable and memorable.  </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-14">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Wifi className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Free WiFi</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <HandPlatter className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Restaurant</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Car className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Free Parking</h2>
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
                  <h2 className="text-lg font-semibold">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Dumbbell className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Fitness Center</h2>
                  <p className="text-sm text-gray-500">
                    Modern equipment and personal trainers
                  </p>
                </div>
              </div>
            </div>

          </section>


          {/* Section 6  */}
          <section className="h-screen p-6 bg-white">
            <div>
              <div className="mt-11 text-center mb-10">
                <h1 className="text-2xl font-bold text-black inline-bloc px-4 py-2">
                  Guest Testimonials
                </h1>
                <h3 className='mt-2'>See what our guest have to say about their stay  </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-14">
                {feedback.map((item, index) => (
                  <div key={index}>

                    <div className="border-l-4 border-blue-300 pl-3">
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