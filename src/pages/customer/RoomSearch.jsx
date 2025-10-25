import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { BedDoubleIcon, MinusIcon, Plus, User, Search, Calendar, Users } from 'lucide-react'
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
import { toast } from 'sonner';
import BookingNoAccount from './modals/sheets/BookingNoAccount';
import { Badge } from '@/components/ui/badge';
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
  const [extraGuestPrice, setExtraGuestPrice] = useState(0);
  const [bedPrice, setBedPrice] = useState(0);
  const getExtraGuestAndBedPrice = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getExtraGuestAndBedPrice");
      const res = await axios.post(url, formData);
      console.log("res ni guestihbuhbhub",res.data);
      setExtraGuestPrice(res.data.extraGuestPrice);
      setBedPrice(res.data.bedPrice);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  const getRooms = useCallback(async (data) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const finalAdultNumber = adultNumber < 1 ? 1 : adultNumber;
      const jsonData = {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guestNumber: Number(finalAdultNumber) + Number(childrenNumber),
      };
      const formData = new FormData();
      formData.append("operation", "getAvailableRoomsWithGuests");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      setRooms(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  }, [adultNumber, childrenNumber]);

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
  };

  const onSubmit = async (data) => {
    const finalAdultNumber = adultNumber < 1 ? 1 : adultNumber;

    localStorage.setItem("checkIn", data.checkIn);
    localStorage.setItem("checkOut", data.checkOut);
    localStorage.setItem("children", childrenNumber);
    localStorage.setItem("adult", finalAdultNumber);
    localStorage.setItem("guestNumber", Number(finalAdultNumber) + Number(childrenNumber));

    await getRooms(data);
    setIsSearched(true);
  };

  // Update form values when localStorage changes
  useEffect(() => {
    const checkIn = localStorage.getItem("checkIn");
    const checkOut = localStorage.getItem("checkOut");

    if (checkIn && checkOut) {
      getRooms({ checkIn, checkOut });
    }

    if (checkIn) form.setValue("checkIn", checkIn);
    if (checkOut) form.setValue("checkOut", checkOut);
    getExtraGuestAndBedPrice();
  }, [form, getRooms]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <div className="p-2 bg-gradient-to-r from-[#113f67] to-[#226597] rounded-xl shadow-lg">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#113f67]">Find Your Perfect Room</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Discover comfort and luxury</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-1"></div>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#113f67] mb-2">Search Available Rooms</h2>
              <p className="text-sm text-gray-600">Find the perfect accommodation for your stay</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                  {/* Check-in Date */}
                  <div className="lg:col-span-1">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#113f67]" />
                              Check-in
                            </Label>
                            <DatePicker
                              form={form}
                              name={field.name}
                              label=""
                              pastAllowed={false}
                              futureAllowed={true}
                              withTime={false}
                              value={field.value || localStorage.getItem("checkIn") || ""}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Check-out Date */}
                  <div className="lg:col-span-1">
                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#113f67]" />
                              Check-out
                            </Label>
                            <DatePicker
                              form={form}
                              name={field.name}
                              label=""
                              pastAllowed={false}
                              futureAllowed={true}
                              withTime={false}
                              value={field.value || localStorage.getItem("checkOut") || ""}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Adults Counter */}
                  <div className="lg:col-span-1">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-[#113f67]" />
                      Adults
                    </Label>
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdultNumber(Math.max(1, adultNumber - 1))}
                        disabled={adultNumber <= 1}
                        className="h-8 w-8 p-0 hover:bg-[#113f67]/10"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      <div className="mx-4 min-w-[2rem] text-center font-semibold text-[#113f67]">
                        {adultNumber}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdultNumber(adultNumber + 1)}
                        className="h-8 w-8 p-0 hover:bg-[#113f67]/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Children Counter */}
                  <div className="lg:col-span-1">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-[#113f67]" />
                      Children
                    </Label>
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setChildrenNumber(Math.max(0, childrenNumber - 1))}
                        disabled={childrenNumber === 0}
                        className="h-8 w-8 p-0 hover:bg-[#113f67]/10"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      <div className="mx-4 min-w-[2rem] text-center font-semibold text-[#113f67]">
                        {childrenNumber}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setChildrenNumber(childrenNumber + 1)}
                        className="h-8 w-8 p-0 hover:bg-[#113f67]/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="lg:col-span-1 flex items-end">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#113f67] to-[#226597] hover:from-[#0d2f4f] hover:to-[#1a4f7a] text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search Rooms
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {!isSearched ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">Ready to Find Your Room?</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-md">
              Please select your check-in and check-out dates to see available rooms.
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <span className="text-orange-500 font-bold text-xl">!</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">No Rooms Available</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mb-6">
              Sorry, no rooms are available for {Number(adultNumber) + Number(childrenNumber)} guest(s) on your selected dates.
            </p>
            <Button
              onClick={handleClearData}
              variant="outline"
              className="border-[#113f67]/20 text-[#113f67] hover:bg-[#113f67]/5"
            >
              Try Different Dates
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#113f67] mb-2">Available Rooms</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {rooms.length} room{rooms.length !== 1 ? 's' : ''} available for {Number(adultNumber) + Number(childrenNumber)} guest{Number(adultNumber) + Number(childrenNumber) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-4 py-2 rounded-full border border-gray-200/60">
                <Calendar className="w-4 h-4" />
                {rooms.length} result{rooms.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {rooms.map((room, index) => (
                <Card key={index} className="group h-full shadow-lg hover:shadow-2xl transition-all duration-500 border-0 rounded-2xl overflow-hidden bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 transform hover:scale-[1.02] hover:-translate-y-2">
                  <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-2"></div>

                  {/* Image Section */}
                  <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                    <img
                      src={localStorage.getItem("url") + "images/" + room.roomtype_image}
                      alt={room.roomtype_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500/90 backdrop-blur-sm text-white font-medium px-3 py-1 shadow-lg">
                        Available
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="backdrop-blur-sm rounded-full px-2 py-1">
                        <Moreinfo room={room} />
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col p-5 sm:p-6 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-xl sm:text-2xl font-bold text-[#113f67] tracking-tight leading-tight">
                        {room.roomtype_name}
                      </h5>
                      <div className="ml-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-[#113f67]">
                            ₱{Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-gray-500">per night</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                      {room.roomtype_description}
                    </p>

                    {/* Room Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full transition-all duration-300 text-xs font-medium">
                        {room.roomtype_sizes}
                      </Badge>
                      <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full transition-all duration-300 text-xs font-medium flex items-center gap-1">
                        <User size={12} />
                        {room.roomtype_capacity}
                      </Badge>
                      <Badge className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full transition-all duration-300 text-xs font-medium flex items-center gap-1">
                        <BedDoubleIcon size={12} />
                        {room.roomtype_beds}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                      {room.status_id === 3 ? (
                        <div className="flex-1">
                          <BookingNoAccount
                            rooms={rooms}
                            selectedRoom={room}
                            handleClearData={handleClearData}
                            adultNumber={adultNumber}
                            childrenNumber={childrenNumber}
                            extraGuestPrice={extraGuestPrice}
                            bedPrice={bedPrice}
                          />
                        </div>
                      ) : (
                        <Button disabled className="flex-1 bg-gray-100 text-gray-400">Book Now</Button>
                      )}

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomSearch