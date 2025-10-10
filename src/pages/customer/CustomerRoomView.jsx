import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Dumbbell, HandPlatterIcon, SquareArrowOutDownRightIcon, WifiIcon, WineIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import RoomDialogs from './modals/RoomDialogs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

function CustomerRoomView() {
  const [room, setRoom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const navigateTo = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const stored = sessionStorage.getItem('viewRoomDetails');
    console.log("Stored Room Details:", stored);
    if (stored) {
      const roomData = JSON.parse(stored);
      setRoom(roomData);
      
      // Process images
      const imagesList = [];
      const baseUrl = localStorage.getItem("url") + "images/";
      
      // Add main image first
      if (roomData.roomtype_image) {
        imagesList.push({
          src: baseUrl + roomData.roomtype_image,
          alt: `${roomData.roomtype_name} - Main View`,
          isMain: true
        });
      }
      
      // Add additional images
      if (roomData.images) {
        const additionalImages = roomData.images.split(',');
        additionalImages.forEach((img, index) => {
          if (img.trim()) {
            imagesList.push({
              src: baseUrl + img.trim(),
              alt: `${roomData.roomtype_name} - View ${index + 2}`,
              isMain: false
            });
          }
        });
      }
      
      setAllImages(imagesList);
      console.log("Processed Images:", imagesList);
    }
  }, []);

  const nextImage = () => {
    if (allImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
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
      {/* Image Gallery */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
        {allImages.length > 0 ? (
          <>
            {/* Main Image Display */}
            <div className="relative w-full h-full">
              <img
                src={allImages[currentIndex]?.src}
                alt={allImages[currentIndex]?.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback when image fails to load */}
              <div className="absolute inset-0 flex items-center justify-center bg-blue-600 text-white" style={{display: 'none'}}>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Room Gallery</h2>
                  <p className="text-blue-100">Image not available</p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {allImages.length}
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex 
                        ? 'border-white shadow-lg' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xs" style={{display: 'none'}}>
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Image Title Overlay */}
            <div className="absolute bottom-20 left-4 text-white">
              <h2 className="text-xl font-semibold mb-1">{allImages[currentIndex]?.alt}</h2>
              {allImages[currentIndex]?.isMain && (
                <Badge className="bg-blue-600 text-white">Main View</Badge>
              )}
            </div>
          </>
        ) : (
          // Fallback when no images available
          <div className="absolute inset-0 flex items-center justify-center bg-blue-600">
            <div className="text-center text-white">
              <h2 className="text-2xl font-semibold mb-2">Room Gallery</h2>
              <p className="text-blue-100">No images available</p>
            </div>
          </div>
        )}
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
              'Electric Water Kettle',
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
              { icon: HandPlatterIcon, text: 'Restaurant' },
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
        {/* <div className="w-full max-w-5xl mt-8">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <RoomDialogs />
          </div>
        </div> */}

        {/* Back Button */}
        <div className="mt-8 mb-12 w-full max-w-5xl flex justify-start">
          <Button className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"  onClick={() => navigateTo("/")}>
            ← BACK TO ROOM
          </Button>
        </div>
      </section>
    </div>
  );
}

export default CustomerRoomView;
