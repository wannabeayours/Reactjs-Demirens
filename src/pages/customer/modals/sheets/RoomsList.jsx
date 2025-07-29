
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'

function RoomsList({ rooms, selectedRooms, setSelectedRooms }) {
 const [open, setOpen] = useState(false)
 const [availableRooms, setAvailableRooms] = useState([])


 const handleBookedRoom = (room) => {
  setSelectedRooms([...selectedRooms, room]);
  setOpen(false);
 }

 useEffect(() => {
  const filteredRooms = rooms.filter((room) => room.status_id === 3 );
  setAvailableRooms(filteredRooms || []);
  console.log("filtered rooms", filteredRooms);
 }, [rooms, selectedRooms, setSelectedRooms])


 return (
  <>
   <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
     <Button className="bg-[#FDF5AA] hover:bg-yellow-600 text-black">Add Room</Button>
    </SheetTrigger>
    <SheetContent side="bottom">
     
     <ScrollArea className="md:h-[calc(100vh-200px)] h-[100vh]">
      {availableRooms.length > 0 ? availableRooms.map((rooms, index) => (
       <div>
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
         <div className="flex justify-center">
          <Carousel className="w-full max-w-[280px]">
           <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
             <CarouselItem key={index}>
              <div className="p-1">
               <Card>
                <CardContent className="flex aspect-square items-center justify-center p-4">
                 <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
               </Card>
              </div>
             </CarouselItem>
            ))}
           </CarouselContent>
           <CarouselPrevious className="left-1" />
           <CarouselNext className="right-1" />
          </Carousel>
         </div>
         <div>
          <h1 className="font-semibold text-2xl">{rooms.roomtype_name}</h1>
          <h1>{rooms.roomtype_description}</h1>
          <h1 className="font-semibold text-blue-500">₱ {rooms.roomtype_price}</h1>
         </div>
         <div className="relative h-full"> {/* or set a specific height */}
          <Button className="absolute bottom-0 right-0 m-4" onClick={() => handleBookedRoom(rooms)}>Add Room</Button>
         </div>
        </div>
        <Separator className="my-4" />
       </div>
      )) : (
       <div className="text-center p-4">
        <p className="text-sm text-muted-foreground">
         No available rooms
        </p>
       </div>
      )
      }
     </ScrollArea>
    </SheetContent>
   </Sheet>
  </>
 )
}

export default RoomsList