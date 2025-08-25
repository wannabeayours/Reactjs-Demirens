import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { BedDoubleIcon, MinusIcon, Moon, Plus, User } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
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
import DatePicker from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import BookingNoAccount from './modals/sheets/BookingNoAccount';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ScrollBar } from '@/components/ui/scroll-area';

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

function RoomSearch() {
  // Initialize state with localStorage values
  const [adultNumber, setAdultNumber] = useState(() => {
    const stored = localStorage.getItem("adult");
    return stored ? Number(stored) : 1; // Default to 1 adult
  });
  const [childrenNumber, setChildrenNumber] = useState(() => {
    const stored = localStorage.getItem("children");
    return stored ? Number(stored) : 0;
  });
  const [rooms, setRooms] = useState([]);
  const [isSearched, setIsSearched] = useState(true);





  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn: localStorage.getItem("checkIn") || "",
      checkOut: localStorage.getItem("checkOut") || "",
    },
  })



  const getRooms = useCallback(async (data) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const finalAdultNumber = adultNumber < 1 ? 1 : adultNumber;
      console.log("data", data)
      const jsonData = {
        "checkIn": data.checkIn,
        "checkOut": data.checkOut,
        "guestNumber": Number(finalAdultNumber) + Number(childrenNumber)
      }
      console.log("jsonData", jsonData)
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
  }, [adultNumber, childrenNumber])



  const handleClearData = () => {
    localStorage.removeItem("checkIn");
    localStorage.removeItem("checkOut");
    localStorage.removeItem("guestNumber");
    localStorage.removeItem("children");
    localStorage.removeItem("adult");
    setIsSearched(false);
    setAdultNumber(1); // Reset to 1 adult
    setChildrenNumber(0);
    form.reset({
      checkIn: "",
      checkOut: "",
    });
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

  // Update form values when localStorage changes
  useEffect(() => {
    const checkIn = localStorage.getItem("checkIn");
    const checkOut = localStorage.getItem("checkOut");
    getRooms({
      checkIn: checkIn,
      checkOut: checkOut

    })
    if (checkIn) form.setValue("checkIn", checkIn);
    if (checkOut) form.setValue("checkOut", checkOut);
  }, [form, getRooms]);









  return (
    <div className="flex flex-col gap-6 w-full px-2 md:px-8 py-6">


      <section className="bg-gray-100 p-6 rounded-lg shadow min-h-[15vh] w-full ">

        <div className="flex items-center justify-center min-h-[10vh] w-full ">
          <Card className=" w-full max-w-6xl">
            <CardContent>
              <Form {...form}>

                <form onSubmit={form.handleSubmit(onSubmit)} >
                  <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    {/* 
            To prefill the form with values passed from another page (e.g., via localStorage or navigation state), 
            you should initialize your form's default values using those sources.
            This rewrite will:
            - Prefill checkIn, checkOut, adultNumber, and childrenNumber from localStorage if available.
            - Show the values in the form fields.
            - If the user navigated here from another page and those values were set, they will appear.
          */}
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
                            // Prefill value from localStorage if available
                            value={field.value || localStorage.getItem("checkIn") || ""}
                            onChange={field.onChange}
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
                            value={field.value || localStorage.getItem("checkOut") || ""}
                            onChange={field.onChange}
                          />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className={"mb-2 "}>Adults</Label>
                      <div className="flex items-center justify-start space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAdultNumber(adultNumber - 1)}
                          disabled={adultNumber <= 1}
                        >
                          <MinusIcon />
                        </Button>
                        <Input
                          className="w-1/4"
                          type="number"
                          readOnly
                          value={adultNumber}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAdultNumber(adultNumber + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className={"mb-2 "}>Children</Label>
                      <div className="flex items-center justify-start space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setChildrenNumber(childrenNumber - 1)}
                          disabled={childrenNumber === 0}
                        >
                          <MinusIcon />
                        </Button>
                        <Input
                          className="w-1/4"
                          type="number"
                          readOnly
                          value={childrenNumber}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setChildrenNumber(childrenNumber + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-end ">
                      <Button className="w-full  " type="submit">Search</Button>
                    </div>
                  </div>
                  {/* 
          If you want to clear the prefilled values when the user clicks a "Clear" button, 
          call handleClearData() which removes the localStorage items and resets the state.
        */}
                </form>
              </Form>
            </CardContent>

          </Card>
        </div>




      </section>


      <section className=" min-h-[50vh] w-full">
        <ScrollArea className="rounded-md border p-4 ">


          {!isSearched ? (
            <p className="text-center text-lg font-semibold  mt-10">
              Please check in and check out first.
            </p>
          ) : rooms.length === 0 ? (
            <p className="text-center text-lg font-semibold text-gray-600 mt-10">
              No rooms available for {Number(adultNumber < 1 ? 1 : adultNumber) + Number(childrenNumber)} guest(s).
            </p>
          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
              {rooms.map((room, index) => (


                <Card key={index} className="flex flex-col h-full rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border  bg-sky-100">

                  {/* Image Section */}
                  <div className="h-[30vh] w-full overflow-hidden ">
                    <img src={room.image_url} alt="Room" className="w-full h-full object-cover" />

                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col p-4 flex-1">
                    <h5 className="text-4xl font-semibold mb-2  text-blue-500">{room.roomtype_name}</h5>
                    {/* <Button
                    variant="link"
                    className="w-full justify-start"

                  >
                    View Room →
                  </Button> */}
                    <p
                      className="text-sm text-gray-600 mb-4 overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // bilang sa lines na ipakita
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {room.roomtype_description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      {/* Price + Moon icon */}
                      <h2 className="text-xl font-bold text-blue-600 flex items-center gap-1">
                        ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}/day

                      </h2>

                      {/* Room Details in Badge Row */}
                      <div className="flex gap-2">
                        <Badge className="bg-transparent border-blue-500 text-blue-500">{room.room_sizes}</Badge>
                        <Badge className="bg-transparent border-blue-500 text-blue-500">
                          {room.room_capacity}
                          <User size={20} className="ml-1" />
                        </Badge>
                        <Badge className="bg-transparent border-blue-500 text-blue-500">
                          {room.room_beds}
                          <BedDoubleIcon size={20} className="ml-1" />
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-auto">
                      {room.status_id === 3 ? (
                        <BookingNoAccount
                          rooms={rooms}
                          selectedRoom={room}
                          handleClearData={handleClearData}
                          adultNumber={adultNumber}
                          childrenNumber={childrenNumber}
                        />
                      ) : (
                        <Button disabled className="w-full">Book Now</Button>
                      )}
                    </div>
                  </div>


                </Card>
              ))}
            </div>
          )}


          <ScrollBar />
        </ScrollArea >
      </section>

    </div>

  )
}

export default RoomSearch