import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { toast } from 'sonner'

function ConfirmBooking({ open, onOpenChange, summary, onConfirmBooking }) {
  if (!summary) return null;

  const {
    rooms = [],
    numberOfNights = 0,
    vat = 0,
    total = 0,
    downpayment = 0,
    checkIn,
    checkOut,
  } = summary;

  const handleConfirm = () => {
    if (typeof onConfirmBooking === 'function') {
      onConfirmBooking();
    } else {
      toast.error("Booking function is not available.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] h-[600px] p-8 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold leading-none tracking-tight text-[#bba008]">Confirm Booking</DialogTitle>
          <DialogDescription>
            This can no longer be canceled after 24 hours. Please review your booking details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm mt-6 overflow-y-auto max-h-[400px] pr-2">

          <div className="flex justify-between gap-8">
            <div className="flex items-center gap-2">
              <span className="font-medium">Check In:</span>
              <span>{new Date(checkIn).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Check Out:</span>
              <span>{new Date(checkOut).toLocaleDateString()}</span>
            </div>
          </div>

          <Separator className="my-2 " />
          {rooms.length > 0 ? (
            rooms.map((room, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-4">
                {/* Column 1: Image Carousel */}
                <div>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {/* Replace with your actual room images */}
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

                {/* Column 2: Room Label */}
                <div className="flex flex-col justify-center items-center gap-3 p-3">
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="text-lg font-semibold">Room {index + 1}</p>
                </div>

                {/* Column 3: Room Details */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{room.roomtype_name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Guests:</span>
                    <span>{room.guestCount || 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>₱ {Number(room.roomtype_price).toLocaleString()} × {numberOfNights}</span>
                    <span className="text-blue-500 font-medium">
                      ₱ {(Number(room.roomtype_price) * numberOfNights).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="col-span-full">
                  <Separator className="my-2" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm italic text-gray-500">No rooms selected</p>
          )}

          <div className="flex justify-between">
            <span className="font-medium">VAT (12%):</span>
            <span>₱ {Number(vat).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>₱ {Number(total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-red-500">
            <span>Downpayment (50%):</span>
            <span>₱ {Number(downpayment).toLocaleString()}</span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm} className="bg-[#FDF5AA] hover:bg-yellow-600 text-black">Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmBooking;
