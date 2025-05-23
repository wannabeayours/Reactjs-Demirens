import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { Trash2 } from 'lucide-react'

function BookingWaccount({ rooms, selectedRoom }) {
 const [allRooms, setAllRooms] = useState([])
 const [selectedRooms, setSelectedRooms] = useState([])
 const [open, setOpen] = useState(false)



 useEffect(() => {
  if (open) {
   console.log("selectedRoom", selectedRoom)
   setAllRooms(rooms)
   setSelectedRooms([{
    roomtype_name: selectedRoom.roomtype_name,
    roomtype_price: selectedRoom.roomtype_price,
    room_type_id: selectedRoom.room_type_id,
    roomtype_description: selectedRoom.roomtype_description
   }])
  }
 }, [open, rooms, selectedRoom])
 return (
  <>
   <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
     <Button>Book Now</Button>
    </SheetTrigger>
    <SheetContent side="bottom">

     <SheetTitle>Book Now</SheetTitle>
     <div>
      <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
       <CardContent>
        <ScrollArea>
         <div className="h-[calc(100vh-300px)]">
          {selectedRooms.length > 0 ? (
           <>
            {selectedRooms.map((room, index) => (
             <div key={index}>
              <div className="flex justify-end">
               <Trash2 className="cursor-pointer text-red-500" />

              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <h1 className="font-semibold text-2xl">{room.roomtype_name}</h1>
                <h1>{room.roomtype_description}</h1>
                <h1 className="font-semibold text-blue-500">₱ {room.roomtype_price}</h1>
               </div>

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

              </div>
              <Separator className="w-full mt-4" />
             </div>

            ))}
           </>
          ) : (
           <p>No rooms selected</p>
          )}
         </div>
        </ScrollArea>




       </CardContent>

      </Card>
      <div className=" space-y-3">
       <Card>
        <CardContent>
         <h1>BOOKING</h1>
        </CardContent>

       </Card>
       <Card>
        <CardContent>
         <h1>BOOKING</h1>
        </CardContent>

       </Card>
      </div>

     </div>


    </SheetContent>

   </Sheet>
  </>
 )

}

export default BookingWaccount