import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/layout/LandingHeader';
import Footer from '@/components/layout/Footer';


function Landingpage() {
  const [feedback, setFeedback] = useState([]);

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
  useEffect(() => {
    getFeedbacks();
  }, []);
  return (
    <>
      <LandingHeader />
      <div className="scroll-smooth  ">


        {/* Section 1 - Welcome */}
        <section className="flex items-center justify-center  w-full  h-screen ">
          <h1 className="text-5xl font-bold ">
            WELCOME TO DEMIREN
          </h1>
        </section>

        {/* Section 2  */}
        <section id="about" className="flex items-center justify-center h-screen w-full bg-[#769FCD]">
          <h1 className="text-5xl font-bold ">
            EXPLORE BEST ROOMS IN DEMIREN "vid ang bg ani"
          </h1>
        </section>

        {/* Section 3  */}
        <section className="flex items-center justify-center h-screen bg-white">


          <div className="w-full max-w-4xl">
            <Carousel>
              <CarouselContent>
                <CarouselItem>
                  <div className="flex items-center justify-center bg-gray-200 h-64 rounded-lg">
                    <span className="text-2xl font-semibold">Room 1</span>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="flex items-center justify-center bg-gray-200 h-64 rounded-lg">
                    <span className="text-2xl font-semibold">Room 2</span>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="flex items-center justify-center bg-gray-200 h-64 rounded-lg">
                    <span className="text-2xl font-semibold">Room 3</span>
                  </div>
                </CarouselItem>
              </CarouselContent>

              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
        <section className="flex items-center justify-center h-screen bg-white">
          <div>
            <h1 className="text-3xl font-bold mb-4">Feedbacks</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedback.map((item, index) => (
                <div key={index}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{item.customer_fullname}</CardTitle>
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
              ))}

            </div>




          </div>
        </section>
        <Footer />

      </div>
    </>
  )
}

export default Landingpage