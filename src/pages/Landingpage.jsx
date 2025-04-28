import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'

function Landingpage() {
  return (
    <div className="scroll-smooth">

      {/* Section 1 - Welcome */}
      <section className="flex items-center justify-center  w-full  h-screen bg-white">
        <h1 className="text-5xl font-bold text-gray-800">
          WELCOME TO DEMIREN
        </h1>
      </section>

      {/* Section 2  */}
      <section id="about" className="flex items-center justify-center h-screen w-full bg-[#769FCD]">
        <h1 className="text-5xl font-bold text-gray-700">
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

    </div>
  )
}

export default Landingpage