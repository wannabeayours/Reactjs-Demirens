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

<div className="bg-white w-[90vw] max-w-[1100px] h-auto p-4 rounded-md shadow-xl relative flex flex-col">
  <div className="flex justify-end gap-2">
    <Button onClick={handlePrevious}>Previous</Button>
    <Button onClick={handleNext}>Next</Button>
  </div>
  {/* Header */}
  <div>
    <h1 className="text-4xl font-semibold leading-none tracking-tight font-playfair">Confirm Booking</h1>
    <p className="text-gray-500 mt-1">
      This can no longer be canceled after 24 hours. Please review your booking details below :
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
    <p><span className="font-semibold">Check-in:</span> {new Date(data.checkIn).toLocaleDateString()}</p>
    <p><span className="font-semibold">Check-out:</span> {new Date(data.checkOut).toLocaleDateString()}</p>
  </div>

  {/* Rooms scrollable section */}
  <div className="mt-6 flex-1 flex flex-col">
    <h3 className="text-lg font-semibold mb-2 text-[#113F67]">Rooms</h3>
    <ScrollArea className="h-[300px] border rounded-md bg-gray-50">
      <div className="p-3 space-y-3">
        {data.rooms.length > 0 ? (
          data.rooms.map((room, index) => (
            <Card
              key={index}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="pr-3">
                    <p className="font-semibold text-[#113F67]">{room.roomtype_name}</p>
                    <p className="text-xs mt-1 text-muted-foreground max-w-[56ch]">
                      {room.roomtype_description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Per day</p>
                    <p className="font-semibold text-lg">
                      ₱{room.roomtype_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">x {data.numberOfNights} day(s)</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">Adults: {room.adultCount || 0}</Badge>
                  <Badge variant="outline" className="text-xs">Children: {room.childrenCount || 0}</Badge>
                  {room.extraBeds > 0 && (
                    <Badge variant="secondary" className="text-xs">Extra Beds: {room.extraBeds}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No selected rooms found</p>
        )}
      </div>
    </ScrollArea>
  </div>

  {/* Fixed totals (not scrolling) */}
  <div className="mt-6">
    <Card className="bg-white border rounded-lg shadow-sm">
      <CardContent className="py-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">VAT (12%) included</span>
            <span className="font-medium">₱ {vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Downpayment (50%)</span>
            <span className="text-lg font-semibold text-[#113F67]">₱ {downpayment.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

  );
}

export default ConfirmBooking;

