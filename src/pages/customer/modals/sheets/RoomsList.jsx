
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function RoomsList({ rooms, selectedRooms, setSelectedRooms }) {
 const [open, setOpen] = useState(false)
 const [availableRooms, setAvailableRooms] = useState([])


 const handleBookedRoom = (room) => {
  setSelectedRooms([...selectedRooms, {
   roomtype_capacity: room.roomtype_capacity,
   room_type: room.roomtype_id,
   roomtype_price: room.roomtype_price,
   roomtype_description: room.roomtype_description,
   roomtype_name: room.roomtype_name
  }]);

  console.log("selected roooom", room)
  setOpen(false);
 }

 const getRooms = async () => {
  try {
   const url = localStorage.getItem('url') + "customer.php";
   const adultNumber = localStorage.getItem("adult");
   const childrenNumber = localStorage.getItem("children");
   const checkIn = localStorage.getItem("checkIn");
   const checkOut = localStorage.getItem("checkOut");
   const jsonData = {
    "checkIn": checkIn,
    "checkOut": checkOut,
    "guestNumber": 0
   }
   const formData = new FormData();
   formData.append("operation", "getAvailableRoomsWithGuests");
   formData.append("json", JSON.stringify(jsonData));
   const response = await axios.post(url, formData);
   const res = response.data;
   console.log("res ni get rooms mo to", res);
   if (res !== 0) {
    const filteredRooms = res.filter((room) => room.status_id === 3);
    setAvailableRooms(filteredRooms);
   } else {
    setAvailableRooms([]);
   }

   console.log("res ni getRooms", res);
  } catch (error) {
   toast.error("Something went wrong");
   console.error("error", error);

  }
 }

 useEffect(() => {
  // const filteredRooms = rooms.filter((room) => room.status_id === 3);
  // setAvailableRooms(filteredRooms || []);
  // console.log("filtered rooms", filteredRooms);
  if (open) {
   getRooms();
  }
 }, [open])


 return (
  <>
   <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
     <Button >Add Room</Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="rounded-t-3xl bg-blue-50" >

     <ScrollArea className="md:h-[calc(100vh-200px)] h-[100vh]">
      {availableRooms.length > 0 ? availableRooms.map((rooms, index) => (
       <div>
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
         <div className="flex justify-center">
          {rooms.images && rooms.images.length > 0 ? (
           <Carousel className="w-full max-w-xs">
            <CarouselContent>
             {rooms.images.map((room, index) => (
              <CarouselItem key={index}>
               <div className="p-1">
                <Card>
                 <CardContent className="flex aspect-square items-center justify-center p-4">
                  <div className="w-full h-80 overflow-hidden">
                   <img src={localStorage.getItem('url') + "images/" + room.imagesroommaster_filename} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                 </CardContent>
                </Card>
               </div>
              </CarouselItem>
             ))}
            </CarouselContent>
            <CarouselPrevious className="ml-4" />
            <CarouselNext className="mr-4" />
           </Carousel>
          ) : (
           <Card>
            <CardContent className="flex aspect-square items-center justify-center p-4">
             <p className="text-center">No image available</p>
            </CardContent>
           </Card>
          )
          }
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