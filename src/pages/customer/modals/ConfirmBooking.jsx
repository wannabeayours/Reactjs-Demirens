import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

function ConfirmBooking({ open, onClose, summary, onConfirmBooking ,  handleClearData }) {
  if (!open || !summary) return null;
  const {
    rooms = [],
    numberOfNights = 0,
    checkIn,
    checkOut,
    adult,
    children,
  } = summary;

  const subtotalRaw = rooms.reduce((total, room) => {
    return total + Number(room.roomtype_price) * numberOfNights;
  }, 0);

  const subtotal = Number(subtotalRaw.toFixed(2));

  const basePrice = Number((subtotal / 1.12).toFixed(2));
  const vat = Number((subtotal - basePrice).toFixed(2));
  const downpayment = Number((subtotal / 2).toFixed(2));
  const total = subtotal;



  const handleConfirm = () => {
    console.log("Confirm button clicked");
    if (typeof onConfirmBooking === 'function') {
      onConfirmBooking();
    } else {
      toast.error('Booking function is not available.');
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[90vw] max-w-[1100px] h-[700px] p-8 rounded-3xl overflow-y-auto shadow-xl relative">
        <Button onClick={() => onClose()} className="absolute top-4 right-4 text-xl font-bold">×</Button>

        <div>
          <h1 className="text-4xl font-semibold leading-none tracking-tight font-playfair ">Confirm Booking</h1>
          <p className="text-gray-500 mt-1">
            This can no longer be canceled after 24 hours. Please review your booking details below :
          </p>
        </div>

        <div className="space-y-2 text-sm mt-6 overflow-y-auto max-h-[400px] pr-2">
          {/* <div className="flex  gap-8">
            <div className="flex items-center gap-2">
              <span className="font-medium">Check In:</span>
              <span>{new Date(checkIn).toLocaleDateString()}</span>
            </div>
            <div>
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Check Out:</span>
              <span>{new Date(checkOut).toLocaleDateString()}</span>
            </div>
          </div> */}

          <Separator className="my-2" />

          {rooms.length > 0 ? (
            rooms.map((room, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4">
                <div className="m-8">
                  <Carousel className="w-full">
                    <CarouselContent>
                      <CarouselItem>
                        <img src="/images/room1.jpg" alt="Room image" className="rounded-md" />
                      </CarouselItem>
                      <CarouselItem>
                        <img src="/images/room2.jpg" alt="Room image" className="rounded-md" />
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>



                <div className="space-y-1 ">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-2xl">{room.roomtype_name}</span>
                    <span className="text-md">Total Amount: ₱ {Number(total).toLocaleString()}</span>
                    {/* <span className="text-sm text-gray-600">Room Capacity: {room.room_capacity || 'N/A'} guests</span> */}
                  </div>
                  <div className="flex gap-4 ">
                  <div className="flex items-center gap-2 ">
                    <span className="font-medium">Check In:</span>
                    <span>{new Date(checkIn).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2  ">
                    <span className="font-medium">Check Out:</span>
                    <span>{new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                  </div>
                  <div className="flex gap-4  ">
                  <div className="flex items-center gap-2">
                    <span>Adults:</span>
                    <span>{room.adultCount || 0}</span>
                  </div>
                  <div className="h-5 w-px bg-black" />
                  <div className="flex items-center gap-2">
                    <span>Children:</span>
                    <span>{room.childrenCount || 0}</span>
                  </div>
               </div>
               {/* <div className="flex items-center gap-2 mt-2">
                 <span className="font-medium">Total Guests:</span>
                 <span className="font-semibold text-blue-600">{(room.adultCount || 0) + (room.childrenCount || 0)}</span>
               </div> */}
               {room.extraBeds > 0 && (
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-sm text-gray-600">Extra Beds:</span>
                   <span className="text-sm font-medium">{room.extraBeds}</span>
                 </div>
               )}



                  {/* <div className="flex justify-between items-center py-2 text-md">
                    <span>₱ {Number(room.roomtype_price).toLocaleString()} × {numberOfNights}/nights</span>
                    <span className="text-blue-500 font-medium text-xl">
                      ₱ {(Number(room.roomtype_price) * numberOfNights).toLocaleString()}
                    </span>
                  </div> */}
                </div>

                <div className="col-span-full">
                  <Separator className="my-2" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm italic text-gray-500">No rooms selected</p>
          )}

          {/* <div className="flex justify-between items-center py-2 text-md">
            <span className="font-medium text-xl">Total Guests:</span>
            <span className="items-center py-2 text-xl text-blue-600">
              {rooms.reduce((total, room) => total + (room.adultCount || 0) + (room.childrenCount || 0), 0)} guests
            </span>
          </div> */}
          <div className="flex justify-between items-center py-2 text-md">
            <span className="font-medium text-xl">VAT (12%):</span>
            <span className="items-center py-2 text-xl">₱ {Number(vat).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="items-center py-2 text-xl">Total:</span>
            <span className="items-center py-2 text-xl">₱ {Number(total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold ">
            <span className="items-center py-2 text-xl">Downpayment (50%):</span>
            <span className="items-center py-2 text-xl text-blue-500">₱ {Number(downpayment).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-24 items-end ">
          <Button variant="outline" onClick={() => onClose()}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Booking</Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmBooking;

