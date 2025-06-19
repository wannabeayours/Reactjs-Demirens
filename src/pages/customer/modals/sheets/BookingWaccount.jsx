import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import RoomsList from './RoomsList'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { Info, MinusIcon, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Link } from 'react-router-dom'

function BookingWaccount({ rooms, selectedRoom }) {
  const [allRooms, setAllRooms] = useState([])
  const [selectedRooms, setSelectedRooms] = useState([])
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(new Date())
  const [checkOut, setCheckOut] = useState(new Date())
  const [numberOfNights, setNumberOfNights] = useState(1)
  const [guestNumber, setGuestNumber] = useState(0);


  const customerBookingWithAccount = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const customerId = localStorage.getItem("userId");
      const downPayment = (selectedRooms.reduce((total, room) => total + (Number(room.roomtype_price) * numberOfNights), 0) * 1.12 * 0.5).toFixed(2);
      const bookingDetails = {
        "checkIn": checkIn,
        "checkOut": checkOut,
        "downpayment": downPayment,
      }
      const roomDetails = selectedRooms.map((room) => {
        return {
          roomTypeId: room.room_type,
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
      }


    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }


  useEffect(() => {
    if (open) {
      const checkInStr = localStorage.getItem('checkIn')
      const checkOutStr = localStorage.getItem('checkOut')
      const checkInDate = new Date(checkInStr)
      const checkOutDate = new Date(checkOutStr)
      setCheckIn(checkInDate)
      setCheckOut(checkOutDate)

      // Calculate number of gabii
      const diffTime = checkOutDate.getTime() - checkInDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // convert ms to days

      setNumberOfNights(diffDays)

      setAllRooms(rooms)
      setSelectedRooms([{
        roomtype_name: selectedRoom.roomtype_name,
        roomtype_price: selectedRoom.roomtype_price,
        room_type: selectedRoom.room_type,
        roomtype_description: selectedRoom.roomtype_description
      }])
    }
  }, [open, rooms, selectedRoom])
  return (
    <>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="w-full">Book Now</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <ScrollArea className="h-[100vh] md:h-[calc(100vh-300px)]" >
            <SheetTitle>Book Now</SheetTitle>

            <div className="flex items-start justify-start space-x-3 p-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-end">
                <RoomsList rooms={allRooms} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} />
              </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">

              <Card>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div >
                      {selectedRooms.length > 0 ? (
                        <>
                          {selectedRooms.map((room, index) => (
                            <div key={index}>
                              <div className="flex justify-end">
                                <Trash2 className="cursor-pointer text-red-500" />

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
                                  <h1 className="font-semibold text-blue-500">₱ {room.roomtype_price}</h1>
                                  <div className="mt-4">
                                    <Label className={"mb-2"}>Number of Guests</Label>
                                    <div className="flex items-center justify-start space-x-2">

                                      <Button type="button" variant="outline" onClick={() => setGuestNumber(guestNumber - 1)} disabled={guestNumber === 0}><MinusIcon /></Button>
                                      <Input
                                        className="w-1/4"
                                        type="number"
                                        readOnly
                                        value={guestNumber}


                                      />
                                      <Button type="button" variant="outline" onClick={() => setGuestNumber(guestNumber + 1)}><Plus /></Button>

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
                  <CardContent className="space-y-3">
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
                <Card>
                  <CardContent>
                    <h1>PAYMENT METHOD</h1>
                  </CardContent>

                </Card>
                <Button onClick={customerBookingWithAccount}>Confirm Booking</Button>
              </div>

            </div>
          </ScrollArea>



        </SheetContent>

      </Sheet>
    </>
  )

}

export default BookingWaccount