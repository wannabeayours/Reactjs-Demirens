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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Loading Room Details</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Image Carousel */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-blue-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-semibold mb-2">Room Gallery</h2>
            <p className="text-blue-100">View room photos and details</p>
          </div>
        </div>
      </section>

      {/* Room Info */}
      <section className="flex flex-col items-center px-6 py-12">
        <div className="max-w-6xl text-start">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {room.roomtype_name}
            </h1>
            <div className="w-20 h-1 bg-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">{room.roomtype_description}</p>
          </div>

          {/* Room Details */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-5xl">
            <div className="p-4 rounded-lg bg-blue-50 border text-center">
              <div className="text-xl font-semibold text-gray-800 mb-1">
                ₱{Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-gray-600">per night</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border text-center">
              <div className="text-xl font-semibold text-gray-800 mb-1">
                {room.room_capacity}
              </div>
              <div className="text-sm text-gray-600">Room Capacity</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border text-center">
              <div className="text-xl font-semibold text-gray-800 mb-1">
                {room.max_capacity}
              </div>
              <div className="text-sm text-gray-600">Max Capacity</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border text-center">
              <div className="text-xl font-semibold text-gray-800 mb-1">
                {room.room_beds}
              </div>
              <div className="text-sm text-gray-600">Beds</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border text-center">
              <div className="text-lg font-semibold text-gray-800 mb-1">
                {room.room_sizes}
              </div>
              <div className="text-sm text-gray-600">Room Size</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-16">
          {/* Column 1 - Room Features */}
          <div className="space-y-3 bg-white rounded-lg p-6 border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Check size={20} className="text-blue-600" />
              Room Features
            </h2>
            {[
              'Iron / Ironing Board',
              'Complimentary Bottled Water',
              'Coffee & Tea Making Amenities',
              'Electric Water Kettle',
              'Mini Bar',
              'Air Conditioning',
              'In-room Safe',
              'Cable TV'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Column 2 - Bathroom Features */}
          <div className="space-y-3 bg-white rounded-lg p-6 border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Check size={20} className="text-blue-600" />
              Bathroom Features
            </h2>
            {[
              'Bidet',
              'Air Conditioning',
              'Hot & Cold Shower',
              'Hot & Cold Bathtub',
              'Hair Dryer',
              'Room service'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Column 3 - Hotel Amenities */}
          <div className="space-y-3 bg-white rounded-lg p-6 border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <WineIcon size={20} className="text-blue-600" />
              Hotel Amenities
            </h2>
            {[
              { icon: WineIcon, text: 'Bar/Lounge' },
              { icon: HandPlatterIcon, text: 'Restaurant' },
              { icon: SquareArrowOutDownRightIcon, text: 'Outdoor Pool & Bar' },
              { icon: Dumbbell, text: 'Fitness Center' },
              { icon: WifiIcon, text: 'Wi-Fi in Public Areas' }
            ].map((amenity, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <amenity.icon size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">{amenity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-full max-w-5xl mt-12 mb-8">
          <div className="h-px bg-gray-300"></div>
        </div>

        {/* Check-in/Check-out Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Check size={18} className="text-green-600" />
              CHECK-IN
            </h3>
            <div className="flex items-center gap-2 text-gray-700">
              <Check size={16} className="text-blue-600" />
              <span>From 3:00 PM to 12:00 PM</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Check size={18} className="text-red-600" />
              CHECK-OUT
            </h3>
            <div className="flex items-center gap-2 text-gray-700">
              <Check size={16} className="text-blue-600" />
              <span>From 12:00 PM to 2:00 PM</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="w-full max-w-5xl mt-12">
          <div className="bg-gray-50 rounded-lg p-8 border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              TERMS AND CONDITIONS
            </h2>
            <div className="bg-white rounded-lg p-6 border">
              <p className="text-gray-700 leading-relaxed">
                In preparation for your stay at Demiren Hotel, a comprehensive email containing detailed check-in
                instructions will be dispatched to you five days prior to your scheduled arrival. Upon your arrival at our establishment,
                our courteous front desk staff will be on hand to extend a warm welcome and assist with your check-in process. Should you require further
                information or have specific inquiries regarding your reservation, we kindly invite you to reach out to us using the contact details provided
                in your booking confirmation. Your comfort and satisfaction are our utmost priorities, and we eagerly anticipate the opportunity to serve you.
              </p>
            </div>
          </div>
        </div>

        {/* Dialog Section */}
        <div className="w-full max-w-5xl mt-8">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <RoomDialogs />
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 mb-12 w-full max-w-5xl flex justify-start">
          <Button className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
            ← BACK TO ROOMS
          </Button>
        </div>
      </section>
    </div>
  );
}

export default CustomerRoomView;
