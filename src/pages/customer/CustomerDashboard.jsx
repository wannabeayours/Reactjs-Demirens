import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BedDoubleIcon, MinusIcon, Moon, Plus, Smile, User } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import BookingWaccount from './modals/sheets/BookingWaccount'
import DatePicker from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import Moreinfo from './modals/sheets/Moreinfo';





const schema = z.object({
  checkIn: z.string().min(1, { message: "Check in is required" }),
  checkOut: z.string().min(1, { message: "Check out is required" }),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return false;
  }


  const normalize = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());

  return normalize(checkOut).getTime() > normalize(checkIn).getTime();
}, {
  message: "Check out must be later than check in",
  path: ["checkOut"],
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const now = new Date();
  return checkIn.getTime() > now.getTime();
}, {
  message: "Check in must be in the future",
  path: ["checkIn"],
});

function CustomerDashboard() {
  const [rooms, setRooms] = useState([]);
  const [adultNumber, setAdultNumber] = useState(0);
  const [childrenNumber, setChildrenNumber] = useState(0);
  const [isSearched, setIsSearched] = useState(false);

  // Utility at top of component
  const getTomorrowAndNextDay = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    // Convert to yyyy-mm-dd for DatePicker
    const format = (d) => d.toISOString().split('T')[0];
    return {
      checkIn: format(tomorrow),
      checkOut: format(nextDay),
    };
  };

  React.useEffect(() => {
    const { checkIn, checkOut } = getTomorrowAndNextDay();

    // set form values
    form.setValue("checkIn", checkIn);
    form.setValue("checkOut", checkOut);

    // set default adult
    setAdultNumber(1);

    // also set in localStorage for consistency if needed
    localStorage.setItem("checkIn", checkIn);
    localStorage.setItem("checkOut", checkOut);
    localStorage.setItem("adult", 1);
    localStorage.setItem("children", 0);
    localStorage.setItem("guestNumber", 1);

    // Immediately fetch rooms
    getRooms({ checkIn, checkOut });
    setIsSearched(true);
  }, []); // runs once on mount




  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn: "",
      checkOut: "",

    },
  })

  const getRooms = async (data) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const jsonData = {
        "checkIn": data.checkIn,
        "checkOut": data.checkOut,
        "guestNumber": Number(adultNumber) + Number(childrenNumber)
      }
      const formData = new FormData();
      formData.append("operation", "getAvailableRoomsWithGuests");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res ni getRooms", res);
      setRooms(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }
  const handleClearData = () => {
    form.reset({ checkIn: "", checkOut: "" })
    setAdultNumber(0);
    setChildrenNumber(0);
    localStorage.removeItem("checkIn");
    localStorage.removeItem("checkOut");
    localStorage.removeItem("guestNumber");
    localStorage.removeItem("children");
    localStorage.removeItem("adult");
    setIsSearched(false);
  }

  const onSubmit = async (data) => {
    // Ensure at least 1 adult is always set
    const finalAdultNumber = adultNumber < 1 ? 1 : adultNumber;

    localStorage.setItem("checkIn", data.checkIn);
    localStorage.setItem("checkOut", data.checkOut);
    localStorage.setItem("children", childrenNumber);
    localStorage.setItem("adult", finalAdultNumber);
    localStorage.setItem("guestNumber", Number(finalAdultNumber) + Number(childrenNumber));
    console.log("mga data sa pag search", data);
    getRooms(data);
    setIsSearched(true);
  }

  return (

    <div className=" min-h-screen text-white">


      <div className="flex items-center justify-center min-h-[10vh] w-full py-10 px-4">
        <Card className=" w-full max-w-6xl">
          <CardContent>
            <Form {...form}>

              <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                  <FormField
                    control={form.control}
                    name="checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <DatePicker
                          form={form}
                          name={field.name}
                          label="Check-in"
                          pastAllowed={false}
                          futureAllowed={true}
                          withTime={false}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <DatePicker
                          form={form}
                          name={field.name}
                          label="Check-out"
                          pastAllowed={false}
                          futureAllowed={true}
                          withTime={false}
                          
                        />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label className={"mb-2 items-center justify-center"}>Adults</Label>
                    <div className="flex items-center justify-center space-x-2">

                      <Button type="button" variant="outline" onClick={() => setAdultNumber(adultNumber - 1)} disabled={adultNumber === 0}><MinusIcon /></Button>
                      <div>
                        {adultNumber}
                      </div>
                      {/* <Input
                        className="w-1/4"
                        type="number"
                        readOnly
                        value={adultNumber}
                      /> */}
                      <Button type="button" variant="outline" onClick={() => setAdultNumber(adultNumber + 1)}><Plus /></Button>

                    </div>
                  </div>

                  <div>
                    <Label className={"mb-2 "}>Children</Label>
                    <div className="flex items-center justify-start space-x-2">

                      <Button type="button" variant="outline" onClick={() => setChildrenNumber(childrenNumber - 1)} disabled={childrenNumber === 0}><MinusIcon /></Button>
                      <div>
                        {childrenNumber}
                      </div>

                      {/* <Input
                        className="w-1/4"
                        type="number"
                        readOnly
                        value={childrenNumber}
                      /> */}
                      <Button type="button" variant="outline" onClick={() => setChildrenNumber(childrenNumber + 1)}><Plus /></Button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button type="submit" className="w-full">Search</Button>


                  </div>
                </div>



              </form>

            </Form>
          </CardContent>

        </Card>


      </div>

      <div className="flex flex-col items-center justify-center py-10 px-4 ">
        {!isSearched ? (
          <p className="text-center text-lg font-semibold text-gray-600 mt-10">
            Please check in and check out first.
          </p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-lg font-semibold text-gray-600 mt-10">
            No rooms available for {Number(adultNumber) + Number(childrenNumber)} guest(s).
          </p>
        ) : (

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
            {rooms.map((room, index) => (
              <Card key={index} className="flex flex-col h-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 bg-gradient-to-b from-white to-sky-50 overflow-hidden transform hover:-translate-y-1">

                {/* Image Section */}
                <div className="w-full h-56 overflow-hidden relative">
                  <img
                    src={localStorage.getItem("url") + "images/" + room.roomtype_image}
                    alt="Room"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-0 right-0 m-2">
                    <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
                      Available
                    </Badge>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col p-5 flex-1">
                  <h5 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-900 tracking-tight">{room.roomtype_name}</h5>

                  <p
                    className="text-sm md:text-base text-gray-700 mb-4 overflow-hidden leading-relaxed font-light"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3, // bilang sa lines na ipakita
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {room.roomtype_description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    {/* Price + Bed icon */}
                    <h2 className="flex-col text-sm font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                      ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}/day

                    </h2>

                    {/* Room Details in Badge Row */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full transition-colors shadow-sm">{room.roomtype_sizes}</Badge>
                      <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full transition-colors shadow-sm">
                        {room.roomtype_capacity}
                        <User size={16} className="ml-1 text-blue-600" />
                      </Badge>
                      <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full transition-colors shadow-sm">
                        {room.roomtype_beds}
                        <BedDoubleIcon size={16} className="ml-1 text-blue-600" />
                      </Badge>
                    </div>
                  </div>

                  <div className="flex mt-auto pt-3 border-t border-blue-100 gap-2">
                   
                    {room.status_id === 3 ? (
                      <BookingWaccount
                        rooms={rooms}
                        selectedRoom={room}
                        handleClearData={handleClearData}
                        adultNumber={adultNumber}
                        childrenNumber={childrenNumber}
                      />
                    ) : (
                      <Button disabled className="w-full bg-gray-300 hover:bg-gray-300 text-gray-600 font-medium rounded-lg py-2 shadow-sm">Book Now</Button>
                    )}
                     <Moreinfo room={room} />
                  </div>
                </div>




              </Card>
            ))}
          </div>
        )}



      </div>
    </div>
  )
}
export default CustomerDashboard