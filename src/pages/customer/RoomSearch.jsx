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
import ConfirmBooking from './modals/ConfirmBooking';
import CustomerPayment from '../admin/SubPages/CustomerPayment';

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
  const [currentStep, setCurrentStep] = useState(1);
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

  const Stepper = ({ steps, currentStep }) => {
    return (
      <div className="flex items-center justify-center gap-4 w-full">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;

          return (
            <div key={index} className="flex flex-col items-center justify-center w-full">
              <div className="flex items-center w-full">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-sm transition-all duration-300
                  ${isActive ? "border-blue-600 bg-blue-600 text-white scale-110" : ""}
                  ${isCompleted ? "border-green-600 bg-green-600 text-white" : ""}
                  ${!isActive && !isCompleted ? "border-gray-300 text-gray-500 bg-gray-50" : ""}
                `}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-1.5 mx-2 rounded-full transition-all duration-300
                    ${isCompleted ? "bg-green-600" : "bg-gray-200"}
                  `}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-sm font-medium text-center transition-all duration-300
                ${isActive ? "text-blue-700 scale-105" : "text-gray-600"}
              `}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

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

  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    handleNext();
  }

const [summaryInfo, setSummaryInfo] = useState({});

  const handleGetSummaryInfo = (summaryInfo) =>{
    console.log("summaryInfo", summaryInfo)
    setSummaryInfo(summaryInfo);
    handleNext();
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

  const handleNext = () => {
    setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  }

  const roomSearchComponent = () => {
    return (
      <div className="flex flex-col w-full h-full">
        {/* Sticky search section with enhanced styling */}
        <section className="sticky top-0 z-10  bg-white">
          <div className="bg-gradient-to-r from-blue-50 to-sky-50  mb-2">
            <Card className=" border-0 shadow-none bg-transparent">
              <CardContent >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                      {/* Keep existing FormField components with enhanced styling */}
                      <FormField
                        control={form.control}
                        name="checkIn"
                        render={({ field }) => (
                          <FormItem className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <DatePicker
                              form={form}
                              name={field.name}
                              label="Check-in"
                              pastAllowed={false}
                              futureAllowed={true}
                              withTime={false}
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
                          <FormItem className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
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

                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <Label className="text-gray-700 font-medium mb-2 block">Adults</Label>
                        <div className="flex items-center justify-start space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 rounded-md border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setAdultNumber(adultNumber - 1)}
                            disabled={adultNumber <= 1}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <Input
                            className="w-14 text-center h-9"
                            type="number"
                            readOnly
                            value={adultNumber}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 rounded-md border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setAdultNumber(adultNumber + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <Label className="text-gray-700 font-medium mb-2 block">Children</Label>
                        <div className="flex items-center justify-start space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 rounded-md border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setChildrenNumber(childrenNumber - 1)}
                            disabled={childrenNumber === 0}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <Input
                            className="w-14 text-center h-9"
                            type="number"
                            readOnly
                            value={childrenNumber}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 rounded-md border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setChildrenNumber(childrenNumber + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-end bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 h-9 rounded-md" 
                          type="submit"
                        >
                          Search Rooms
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Scrollable rooms section with improved layout */}
        <section className="flex-1 overflow-auto">
          <ScrollArea className="h-[calc(100vh-280px)] rounded-xl border-0 shadow-sm p-4 bg-gray-50">
            {!isSearched ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md">
                  <Moon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    Ready to find your perfect stay?
                  </p>
                  <p className="text-gray-600">
                    Please select your check-in and check-out dates to see available rooms.
                  </p>
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md">
                  <User className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    No rooms available
                  </p>
                  <p className="text-gray-600">
                    We couldn't find any rooms available for {Number(adultNumber < 1 ? 1 : adultNumber) + Number(childrenNumber)} guest(s) on your selected dates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {rooms.map((room, index) => (
                  <Card key={index} className="flex flex-col h-full rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden bg-white">
                    {/* Image Section with hover effect */}
                    <div className="h-52 w-full overflow-hidden relative group">
                      <img
                        src={localStorage.getItem("url") + "images/" + room.roomtype_image} 
                        alt={room.roomtype_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Info Section with improved typography and spacing */}
                    <div className="flex flex-col p-5 flex-1">
                      <h5 className="text-2xl font-semibold mb-2 text-blue-700">{room.roomtype_name}</h5>
                      <p
                        className="text-sm text-gray-600 mb-4 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {room.roomtype_description}
                      </p>
                      
                      {/* Room Details in Badge Row with consistent styling */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full">{room.roomtype_sizes}</Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full">
                          {room.roomtype_capacity}
                          <User size={14} className="ml-1" />
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full">
                          {room.roomtype_beds}
                          <BedDoubleIcon size={14} className="ml-1" />
                        </Badge>
                      </div>
                      
                      {/* Price with improved styling */}
                      <div className="mt-auto">
                        <h2 className="text-xl font-bold text-blue-700 mb-4">
                          ₱ {Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}<span className="text-sm font-normal text-gray-500">/night</span>
                        </h2>
                        
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2" 
                          onClick={() => handleSelectRoom(room)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <ScrollBar />
          </ScrollArea>
        </section>
      </div>
    );
  }

  const steps = [
    { label: "Search Room", content: () => roomSearchComponent() },
    { label: "Details", content: () => <BookingNoAccount handleGetSummaryInfo={handleGetSummaryInfo} rooms={rooms} selectedRoom={selectedRoom} handleClearData={handleClearData} adultNumber={adultNumber} childrenNumber={childrenNumber} />},
    { label: "Confirm", content: () => <ConfirmBooking summary={summaryInfo} handleNext={handleNext} handlePrevious={handlePrevious} /> },
    { label: "Finish", content: () => <CustomerPayment customer={summaryInfo} handleNext={handleNext} handlePrevious={handlePrevious} handle/>},
  ];







  return (
    <>
      <div className="w-full mx-auto flex flex-col h-screen bg-white">
        {/* Sticky header with stepper - improved z-index and shadow */}
        <div className="sticky top-0 bg-white z-20 p-5 shadow-sm border-b border-gray-100">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Content area with auto overflow */}
        <div className="flex-1 overflow-auto p-5">
          {steps[currentStep - 1].content()}
        </div>
      </div>
    </>
  )
}

export default RoomSearch