import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Check, Dumbbell, HandPlatterIcon, SquareArrowOutDownRightIcon, WifiIcon, WineIcon } from 'lucide-react'
import React from 'react'

function Moreinfo({ room }) {
 if (!room) return null;

 return (
  <Sheet >
   <SheetTrigger asChild>
    <span className="underline  cursor-pointer">More Info</span>
  </SheetTrigger>
   <SheetContent side="top">
    <ScrollArea className="h-[100vh] md:h-[calc(100vh-350px)]" >
     <div className="flex justify-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 w-full">
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

       {/* Middle Column: Room Details + Amenities */}
       <div className="flex flex-col justify-start items-start space-y-6 p-4 w-full  rounded-2xl">
        <div className="text-start">
         <h1 className="text-3xl font-bold font-playfair text-blue-800">{room.roomtype_name}</h1>
         <p className="text-base text-black mb-4">{room.roomtype_description}</p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full text-sm">
          <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })} /night</h3></div>
          <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Room capacity: {room.room_capacity}</h3></div>
          <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Max Capacity: {room.max_capacity}</h3></div>
          <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Beds: {room.room_beds}</h3></div>
          <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Room size: {room.room_sizes}</h3></div>
         </div>
        </div>

        {/* Amenities */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
         {[
          "Iron / Ironing Board",
          "Complimentary Bottled Water",
          "Coffee & Tea Making Amenities",
          "Electric Water Kettle",
          "Mini Bar",
          "Air Conditioning",
          "In-room Safe",
          "Cable TV",
          "Bidet",
          "Hot & Cold Shower",
          "Hot & Cold Bathtub",
          "Hair Dryer",
          "Room service",
          "Bar/Lounge",
          "Restaurant",
          "Outdoor Pool & Bar",
          "Fitness Center",
          "Wi-Fi in Public Areas"
         ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
           <Check size={16} />
           <span>{item}</span>
          </div>
         ))}
        </div>
       </div>

       {/* Right Column: Check-in / Terms */}
       <div className="space-y-6 text-sm rounded-2xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 gap-y-12 w-[71%] mt-10">
                 <div>
                   <h1 className="text-blue-800 font-bold">CHECK-IN</h1>
                   <div className="flex items-center  gap-2">
                     <Check size={20} />
                     <h1>From 10:00 AM to 11:00 AM</h1>
                   </div>
                 </div>
                 <div>
                   <h1 className="text-blue-800 font-bold">CHECK-OUT</h1>
                   <div className="flex items-center gap-2">
                     <Check size={20} />
                     <h1>From 12:00 PM to 1:00 PM</h1>
                   </div>
                 </div>
               </div>

        <div>
         <h1 className="font-bold font-playfair">TERMS AND CONDITIONS</h1>
         <h2>In preparation for your stay at Demiren Hotel, a comprehensive email containing detailed check-in
          instructions will be dispatched to you five days prior to your scheduled arrival. Upon your arrival at our establishment,
          our courteous front desk staff will be on hand to extend a warm welcome and assist with your check-in process. Should you require further
          information or have specific inquiries regarding your reservation, we kindly invite you to reach out to us using the contact details provided
          in your booking confirmation. Your comfort and satisfaction are our utmost priorities, and we eagerly anticipate the opportunity to serve you.</h2>

        </div>
       </div>
      </div>

     </div>
    </ScrollArea>
   </SheetContent>
  </Sheet>
 )
}

export default Moreinfo