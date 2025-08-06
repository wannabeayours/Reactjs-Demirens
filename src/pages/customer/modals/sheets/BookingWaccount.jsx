import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { BedIcon, Dog, Info, MinusIcon, Plus, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link } from 'react-router-dom'
import ConfirmBooking from '../ConfirmBooking'

function BookingWaccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData }) {
  const [allRooms, setAllRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(new Date())
  const [checkOut, setCheckOut] = useState(new Date())
  const [numberOfNights, setNumberOfNights] = useState(1)
  const [guestNumber, setGuestNumber] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [extraBedCounts, setExtraBedCounts] = useState({});
  const [guestCounts, setGuestCounts] = useState({});




  const customerBookingWithAccount = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const customerId = localStorage.getItem("userId");
      const downPayment = (selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0) * 1.12 * 0.5).toFixed(2);
      const totalAmount = (selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0) * 1.12).toFixed(2);
      const bookingDetails = {
        "checkIn": checkIn,
        "checkOut": checkOut,
        "downpayment": downPayment,
        "totalAmount": totalAmount
      }
      const roomDetails = selectedRooms.map((room) => {
        return {
          roomTypeId: room.room_type,
          guestCount: guestCounts[room.room_type] || 1,
        }
      })
      console.log("roomDetails", roomDetails);
      const jsonData = {
        customerId: customerId,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      }
      const formData = new FormData();
      formData.append("operation", "customerBookingWithAccount");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("noOOo", res);
      if (res.data === 1) {
        toast.success("Booking successful");
        setOpen(false);
        localStorage.removeItem('checkIn')
        localStorage.removeItem('checkOut')
        setSelectedRooms([]);
        handleClearData();
      }


    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }



  useEffect(() => {
    if (open) {
      const checkInStr = localStorage.getItem('checkIn');
      const checkOutStr = localStorage.getItem('checkOut');
      const guestNum = parseInt(localStorage.getItem('guestNumber')) || 1;

      const checkInDate = new Date(checkInStr);
      const checkOutDate = new Date(checkOutStr);
      setCheckIn(checkInDate);
      setCheckOut(checkOutDate);

      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNumberOfNights(diffDays);

      setAllRooms(rooms);

      const selected = {
        roomtype_name: selectedRoom.roomtype_name,
        roomtype_price: selectedRoom.roomtype_price,
        room_type: selectedRoom.room_type,
        roomtype_description: selectedRoom.roomtype_description,
        max_capacity: selectedRoom.max_capacity || 1, // fallback to 1 if undefined
      };

      setSelectedRooms([selected]);

      // ✅ Clamp guest number to max_capacity
      const validGuestNum = Math.min(guestNum, selected.max_capacity);
      setGuestNumber(validGuestNum);

      setGuestCounts({
        [selected.room_type]: validGuestNum
      });

    }
  }, [open, rooms, selectedRoom]);

  useEffect(() => {
    const updatedCounts = { ...guestCounts };
    selectedRooms.forEach(room => {
      if (!updatedCounts[room.room_type]) {
        updatedCounts[room.room_type] = Math.min(
          parseInt(localStorage.getItem('guestNumber')) || 1,
          room.max_capacity || 1
        );
      }
    });
    setGuestCounts(updatedCounts);
  }, [selectedRooms]);




  const handleRemoveRoom = (indexRemove) => {
    const updatedRooms = selectedRooms.filter((_, index) => index !== indexRemove);
    setSelectedRooms(updatedRooms);

    if (updatedRooms.length === 0) {
      setGuestNumber(0);
      setNumberOfNights(1);
      toast.info("Room selection cleared!");
    } else {
      toast.info("Room removed.");
    }
  };

  return (
    <>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="w-full bg-[#FDF5AA] hover:bg-yellow-600 text-black">Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="!bg-[#113F67] text-white p-6 border-none rounded-t-3xl ">
          <ScrollArea className="h-[100vh] md:h-[calc(100vh-300px)]" >


            <div className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="flex space-x-4">
                <div>
                  <Label className="mb-3">Check In</Label>
                  <Input
                    value={checkIn}
                    readOnly
                  />
                </div>
                <div >
                  <Label className="mb-3">Check Out</Label>
                  <Input
                    value={checkOut}
                    readOnly
                  />
                </div>


              </div>
              <Card className="min-w-[900px] bg-transparent shadow-2xl border-none text-white">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <X className="text-red-500" />
                      <h1>NO PETS ALLOWED</h1>

                    </div>

                    <div className="flex items-center gap-2">
                      <X className="text-red-500" />
                      <h1>NO SMOKING</h1>

                    </div>


                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-end">
                <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
              </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">

              <Card className="bg-transparent shadow-2xl  text-white">
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div >
                      {selectedRooms.length > 0 ? (
                        <>
                          {selectedRooms.map((room, index) => (
                            <div key={index}>
                              <div className="flex justify-end">
                                <Trash2 className="cursor-pointer text-red-500"
                                  onClick={() => handleRemoveRoom(index)}
                                />

                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                <div>
                                  <h1 className="font-semibold text-2xl">{room.roomtype_name}</h1>
                                  <h1>{room.roomtype_description}</h1>
                                  <Link>
                                    <div className="flex flex-row space-x-2 text-blue-500">
                                      <div>
                                        More info
                                      </div>
                                      <div>
                                        <Info />
                                      </div>

                                    </div>
                                  </Link>
                                  <h1 className="font-semibold text-blue-500"> ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                                  <div className="mt-4">
                                    <Label className="mb-2">Number of Guests</Label>
                                    <div className="flex items-center justify-start space-x-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                          setGuestCounts(prev => ({
                                            ...prev,
                                            [room.room_type]: Math.max((prev[room.room_type] || 1) - 1, 1),
                                          }))
                                        }
                                        disabled={(guestCounts[room.room_type] || 1) <= 1}
                                      >
                                        <MinusIcon className='text-black' />
                                      </Button>

                                      <Input
                                        className="w-1/4 text-center"
                                        type="number"
                                        readOnly
                                        value={guestCounts[room.room_type] || 1}
                                      />

                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                          setGuestCounts(prev => ({
                                            ...prev,
                                            [room.room_type]: Math.min(
                                              (prev[room.room_type] || 1) + 1,
                                              room.max_capacity || 1
                                            ),
                                          }))
                                        }
                                        disabled={(guestCounts[room.room_type] || 1) >= (room.max_capacity || 1)}
                                      >
                                        <Plus className='text-black' />
                                      </Button>
                                    </div>

                                  </div>

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
                              <div >

                                <Card className="w-full mt-2 border-none shawdow-2xl bg-transparent  text-white ">
                                  <CardContent>
                                    <div className="flex items-center justify-between w-full gap-4">

                                      {/* Label + Icon + Title */}
                                      <div className="flex flex-col">
                                        <Label>Extra</Label>
                                        <div className="flex items-center gap-2">
                                          <h1><BedIcon /></h1>
                                          <h1>Extra Bed</h1>
                                        </div>
                                      </div>

                                      {/* Price */}
                                      <div className="flex flex-col items-end">
                                        <Label>Price</Label>
                                        <h1 className="text-blue-500 whitespace-nowrap">₱ 500.00</h1>
                                      </div>

                                      {/* Quantity */}
                                      <div className="flex flex-col items-center">
                                        <Label>Quantity</Label>
                                        <div className="flex items-center space-x-2 mt-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                              setExtraBedCounts(prev => ({
                                                ...prev,
                                                [room.room_type]: Math.max((prev[room.room_type] || 0) - 1, 0),
                                              }));
                                            }}
                                          >
                                            <MinusIcon className='text-black' />
                                          </Button>

                                          <Input
                                            className="w-16 text-center"
                                            type="number"
                                            readOnly
                                            value={extraBedCounts[room.room_type] || 0}
                                          />

                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                              setExtraBedCounts(prev => ({
                                                ...prev,
                                                [room.room_type]: (prev[room.room_type] || 0) + 1,
                                              }));
                                            }}
                                          >
                                            <Plus className='text-black' />
                                          </Button>



                                        </div>
                                      </div>



                                    </div>
                                  </CardContent>
                                </Card>



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

                <Card className="bg-transparent shadow-2xl  rounded-2xl">
                  <CardContent className="space-y-3 text-white">
                    <h1 className="font-semibold text-lg">BOOKING SUMMARY</h1>
                    {selectedRooms.length > 0 ? selectedRooms.map((room, index) => (
                      <div>

                        <div key={index} className="flex justify-between">
                          <h1 className="font-semibold ">{room.roomtype_name}</h1>
                          <h1 >₱ {(Number(room.roomtype_price) * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>


                        </div>

                        <h1 className="text-end text-sm">{`(${numberOfNights} Nights x ₱ ${(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}</h1>


                        <Separator className="w-full mt-4" />
                      </div>

                    )) : null}


                    <div className="flex justify-between">


                      <h1 className="font-semibold ">Sub Total</h1>
                      <h1 className="font-semibold ">₱ {(selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                    </div>
                    <div className="flex justify-between ">
                      <h1 className="font-semibold">VAT (12%):</h1>
                      <h1 className='font-semibold'>₱ {(selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0) * 0.12).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>

                    </div>
                    <div className="flex justify-end">
                      <hr className="w-1/5 h-1 bg-black border-none" />
                    </div>

                    <div className="flex justify-between ">
                      <h1 className="font-semibold">Total Amount:</h1>
                      <h1 className="font-semibold">
                        ₱ {(
                          selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0) * 1.12
                        ).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h1>

                    </div>
                    <div>
                      <div className="flex justify-between">

                        <h1 className="font-semibold text-red-500">Down Payment: </h1>
                        <h1 className="font-semibold text-red-500">₱ {((selectedRooms.reduce((total, room) => total + Number(room.roomtype_price) * numberOfNights, 0) * 1.12) * 0.5).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>

                      </div>
                      <h1 className="text-red-500">{`(50% of  total amount)`}</h1>
                    </div>

                  </CardContent>

                </Card>
                <Card className="bg-transparent shadow-2xl  rounded-2xl">
                  <CardContent className="space-y-3 text-white">
                    <h1>PAYMENT METHOD</h1>
                  </CardContent>

                </Card>
                <Button
                  className="bg-[#FDF5AA] hover:bg-yellow-600 text-black"

                  onClick={() => {
                    if (selectedRooms.length === 0) return;

                    const subtotal = selectedRooms.reduce(
                      (sum, room) => sum + Number(room.roomtype_price) * numberOfNights,
                      0
                    );
                    const vat = subtotal * 0.12;
                    const total = subtotal + vat;
                    const downpayment = total * 0.5;

                    setSummaryInfo({
                      rooms: selectedRooms.map(room => ({
                        ...room,
                        guestCount: guestCounts[room.room_type] || 1,
                        extraBeds: extraBedCounts[room.room_type] || 0,
                      })),

                      checkIn,
                      checkOut,
                      numberOfNights,
                      vat,
                      total,
                      downpayment,
                    });

                    setShowConfirmModal(true);
                  }}
                >
                  Confirm Booking
                </Button>

                <ConfirmBooking
                  open={showConfirmModal}
                  onOpenChange={setShowConfirmModal}
                  summary={summaryInfo}
                  onConfirmBooking={customerBookingWithAccount}
                />

              </div>

            </div>
          </ScrollArea>



        </SheetContent>

      </Sheet>
    </>
  )

}

export default BookingWaccount