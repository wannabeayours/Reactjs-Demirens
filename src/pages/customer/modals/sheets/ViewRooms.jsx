import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button'


function ViewRooms({ room }) {
  const [open, setOpen] = useState(false);

  if (!room) return null;


  return (

    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="w-full bg-[#bba008] hover:bg-[#bba008]" >View Room</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[55vh] bg-[#0D1423] overflow-y-auto ">
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 w-full ">

              {/* Left Column: Carousel */}
              <div className="flex justify-center w-full">
                <Carousel className="w-full max-w-md">
                  <CarouselContent>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <span className="text-4xl font-semibold">{index + 1}</span>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>

              {/* Right Column: Room Details */}
              <div className="flex flex-col justify-center items-end space-y-4 p-4 w-full border  rounded-2xl">
                <h2 className="text-2xl font-bold text-blue-500]">{room.roomtype_name}</h2>
                <p className="text-white">
                  {room.roomtype_description}
                </p>
                <p className="text-xl font-semibold text-blue-600"> ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per night</p>
                <div>
                  <h1 className="text-lg font-semibold text-[#bba008]">AMENITIES</h1>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-9 text-sm text-white">
                  <div className="flex items-center gap-5">🛏️ Comfortable Beds</div>
                  <div className="flex items-center gap-5">📶 Free Wi-Fi</div>
                  <div className="flex items-center gap-5">📺 Cable TV</div>
                  <div className="flex items-center gap-5">🧼 Bathroom Amenities</div>
                  <div className="flex items-center gap-5">🚿 Hot & Cold Shower</div>
                  <div className="flex items-center gap-5">🛁 Bathtub (select rooms)</div>
                  <div className="flex items-center gap-5">🧊 Air Conditioning</div>
                  <div className="flex items-center gap-5">🔒 In-Room Safe</div>
                  <div className="flex items-center gap-5">☕ Coffee & Tea</div>
                  <div className="flex items-center gap-5">🧃 Mini Bar</div>
                  <div className="flex items-center gap-5">🧺 Iron / Ironing Board</div>
                  <div className="flex items-center gap-5">🍼 Baby Cot (on request)</div>
                  <div className="flex items-center gap-5">🚭 Non-Smoking Rooms</div>
                  <div className="flex items-center gap-5">🧴 Complimentary Toiletries</div>
                  <div className="flex items-center gap-5">☎️ Telephone</div>
                  <div className="flex items-center gap-5">🧹 Room Service</div>
                </div>

              </div>


            </div>
          </div>
        </SheetContent>

      </Sheet>

    </>


  )
}

export default ViewRooms