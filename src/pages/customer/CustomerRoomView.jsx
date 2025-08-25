import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Dumbbell, HandPlatterIcon, SquareArrowOutDownRightIcon, WifiIcon, WineIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import RoomDialogs from './modals/RoomDialogs';
import { Badge } from '@/components/ui/badge';

function CustomerRoomView() {
  const [room, setRoom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const stored = sessionStorage.getItem('viewRoomDetails');
    if (stored) {
      setRoom(JSON.parse(stored));
      console.log("Room Details :", room);
    }
  }, []);

  const nextImage = () => {
    if (room?.images?.length) {
      setCurrentIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room?.images?.length) {
      setCurrentIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };



  if (!room) {
    return <div className="text-center p-10">Loading room...</div>;
  }



  return (
    <div className="w-full">
      {/* Image Carousel */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-slate-500">
        <h1>image ni diri</h1>
      </section>

      {/* Room Info */}
      <section className="h-full flex flex-col items-center px-6">
        <div className="max-w-7xl text-start mt-36">
          <h1 className="text-5xl font-bold font-playfair mb-4 text-blue-800">{room.roomtype_name}</h1>
          <p className="text-lg text-black mb-6">{room.roomtype_description}</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-[70%] text-center">
            <div>
              <h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800 "> ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}/night</h3>
            </div>
            <div>
              <h3 className="px-2 py-2  rounded-full border border-blue-800 text-blue-800 ">Room capacity: {room.room_capacity}</h3>
            </div>
            <div>
              <h3 className="px-2 py-2  rounded-full border border-blue-800 text-blue-800 ">Max Capacity: {room.max_capacity}</h3>
            </div>
            <div>
              <h3 className="px-2 py-2  rounded-full border border-blue-800 text-blue-800 ">Beds: {room.room_beds}</h3>
            </div>
            <div>
              <h3 className="px-2x py-2  rounded-full border border-blue-800 text-blue-800 ">Room size: {room.room_sizes}</h3>
            </div>
       
          </div>


          {/* <p className="text-2xl font-semibold text-blue-600">
            ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 gap-y-12 w-[71%] mt-10">
          {/* Column 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Iron / Ironing Board</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Complimentary Bottled Water</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Coffee & Tea Making Amenities</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Electric Water Kettle</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Mini Bar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Air Conditioning</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>In-room Safe</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Cable TV</h1>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Bidet</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Air Conditioning</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Hot & Cold Shower</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Hot & Cold Bathtub</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Hair Dryer</h1>
            </div>
            <div className="flex items-center gap-2">
              <Check size={20} />
              <h1>Room service</h1>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold font-playfair text-blue-800">Amenities</h1>
            <div className="flex items-center gap-2">
              <WineIcon size={20} />
              <h1>Bar/Lounge</h1>
            </div>
            <div className="flex items-center gap-2">
              <HandPlatterIcon size={20} />
              <h1>Restaurant</h1>
            </div>
            <div className="flex items-center gap-2">
              <SquareArrowOutDownRightIcon size={20} />
              <h1>Outdoor Pool & Bar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell size={20} />
              <h1>Fitness Center</h1>
            </div>
            <div className="flex items-center gap-2">
              <WifiIcon size={20} />
              <h1>Wi-Fi in Public Areas</h1>
            </div>
          </div>

        </div>
        <div className=" w-[71%]">
          <Separator className="mt-6  h-1 bg-gray-800 " />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 gap-y-12 w-[71%] mt-10">
          <div>
            <h1 className="text-blue-800 font-bold">CHECK-IN</h1>
            <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-10 gap-y-12 w-[71%] mt-20">
          <div className="gap-y-4">
            <h1 className="font-bold font-playfair">TERMS AND CONDITIONS</h1>
            <h2>In preparation for your stay at Demiren Hotel, a comprehensive email containing detailed check-in
              instructions will be dispatched to you five days prior to your scheduled arrival. Upon your arrival at our establishment,
              our courteous front desk staff will be on hand to extend a warm welcome and assist with your check-in process. Should you require further
              information or have specific inquiries regarding your reservation, we kindly invite you to reach out to us using the contact details provided
              in your booking confirmation. Your comfort and satisfaction are our utmost priorities, and we eagerly anticipate the opportunity to serve you.</h2>
          </div>

        </div>
        <div className="w-[71%] mt-6">
          <RoomDialogs />
        </div>

        <div className="mt-10 mb-10 w-[71%]  flex justify-start">
          <Button className="px-8 py-4 text-lg rounded-md">
            BACK
          </Button>
        </div>

      </section>


    </div>
  );
}

export default CustomerRoomView;
