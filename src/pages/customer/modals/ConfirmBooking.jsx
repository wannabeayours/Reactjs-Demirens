import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

function ConfirmBooking({ summary, onConfirmBooking, handleNext, handlePrevious }) {

  const [data, setData] = useState({
    rooms: [],
    numberOfNights: 0,
    checkIn: '',
    checkOut: '',
  });

  const subtotalRaw = data.rooms.reduce((total, room) => {
    return total + Number(room.roomtype_price) * data.numberOfNights;
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

  console.log("Summary:", summary);

  useEffect(() => {
    if (summary) {
      setData({
        rooms: summary.rooms || [],
        numberOfNights: summary.numberOfNights || 0,
        checkIn: summary.checkIn || '',
        checkOut: summary.checkOut || '',
      });
    }
  }, [summary]);

  return (
    <div className="bg-white w-full max-w-[900px] h-auto p-8 rounded-xl shadow-md flex flex-col mx-auto">
      {/* Navigation buttons */}


      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-semibold leading-none tracking-tight font-playfair text-blue-800">Confirm Booking</h1>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          This can no longer be canceled after 24 hours. Please review your booking details below:
        </p>
      </div>

      {/* Booking dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 bg-[#F8FBFF] p-4 rounded-lg border border-[#E6EEF8] mb-6">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-gray-500">Check-in Date</p>
          <p className="font-semibold text-lg">{new Date(data.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-gray-500">Check-out Date</p>
          <p className="font-semibold text-lg">{new Date(data.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Rooms scrollable section */}
      <div className="mt-4 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-3 text-[#113F67] text-center">Selected Rooms</h3>
        <ScrollArea className="h-[250px] border rounded-lg bg-[#F8FBFF] shadow-inner">
          <div className="p-4 space-y-4">
            {data.rooms.length > 0 ? (
              data.rooms.map((room, index) => (
                <Card
                  key={index}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <CardContent className="px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className="pr-3">
                        <p className="font-semibold text-[#113F67] text-lg">{room.roomtype_name}</p>
                        <p className="text-sm mt-1 text-gray-600 max-w-[56ch]">
                          {room.roomtype_description}
                        </p>
                      </div>
                      <div className="text-right bg-[#F0F7FF] p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Per night</p>
                        <p className="font-bold text-xl text-[#113F67]">
                          ₱{room.roomtype_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">x {data.numberOfNights} night(s)</p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs py-1 px-3 bg-[#F0F7FF] text-[#113F67] border-[#113F67]/30">Adults: {room.adultCount || 0}</Badge>
                      <Badge variant="outline" className="text-xs py-1 px-3 bg-[#F0F7FF] text-[#113F67] border-[#113F67]/30">Children: {room.childrenCount || 0}</Badge>
                      {room.extraBeds > 0 && (
                        <Badge variant="secondary" className="text-xs py-1 px-3 bg-[#113F67] text-white">Extra Beds: {room.extraBeds}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                <p className="text-sm">No selected rooms found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed totals (not scrolling) */}
      <div className="mt-6">
        <Card className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-sm overflow-hidden">
          <CardContent className="py-5 px-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">VAT (12%) included</span>
                <span className="font-medium">₱ {vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Separator className="bg-gray-300" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#113F67]">Total</span>
                <span className="text-lg font-semibold text-[#113F67]">₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center bg-[#113F67]/10 p-3 rounded-lg">
                <span className="text-lg font-semibold text-[#113F67]">Downpayment (50%)</span>
                <span className="text-lg font-bold text-[#113F67]">₱ {downpayment.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleConfirm}
          className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white  font-semibold py-6 px-8 rounded-lg text-lg w-full max-w-md"
        >
          Confirm Booking
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="border-[#113F67] text-[#113F67] hover:bg-[#113F67]/10"
        >
          &larr; Previous
        </Button>
        <Button
          onClick={handleNext}
          variant="outline"
          className="border-[#113F67] text-[#113F67] hover:bg-[#113F67]/10"
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}

export default ConfirmBooking;

