import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import { Check, Info, Clock, Users, Bed, Maximize, Star, Wifi, Car, Coffee, Utensils, Dumbbell, Waves } from 'lucide-react'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

function Moreinfo({ room }) {
  const [images, setImages] = React.useState([]);
  const [data, setData] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (open) {
      console.log("Room Type:", room);
      const getRoomTypeDetails = async () => {
        try {
          const url = localStorage.getItem('url') + "customer.php";
          const formData = new FormData();
          formData.append("operation", "getRoomTypeDetails");
          formData.append("json", JSON.stringify({ roomTypeId: room.room_type ? room.room_type : room.roomtype_id }));
          const response = await axios.post(url, formData);
          const res = response.data;
          console.log("API Response:", res);
          if (res && res.images) {
            setImages(res.images);
            setData(res);
          } else {
            setImages([]);
            setData(null);
            toast.error("No images found for this room");
          }
        } catch (error) {
          console.log(error);
          toast.error("Something went wrong");
        }
      }
      getRoomTypeDetails();
    }
  }, [open, room])

  const amenityIcons = {
    "Iron / Ironing Board": <Coffee size={16} className="text-[#113f67]" />,
    "Complimentary Bottled Water": <Coffee size={16} className="text-[#113f67]" />,
    "Coffee & Tea Making Amenities": <Coffee size={16} className="text-[#113f67]" />,
    "Electric Water Kettle": <Coffee size={16} className="text-[#113f67]" />,
    "Mini Bar": <Utensils size={16} className="text-[#113f67]" />,
    "Air Conditioning": <Star size={16} className="text-[#113f67]" />,
    "In-room Safe": <Check size={16} className="text-[#113f67]" />,
    "Cable TV": <Star size={16} className="text-[#113f67]" />,
    "Bidet": <Check size={16} className="text-[#113f67]" />,
    "Hot & Cold Shower": <Check size={16} className="text-[#113f67]" />,
    "Hot & Cold Bathtub": <Check size={16} className="text-[#113f67]" />,
    "Hair Dryer": <Check size={16} className="text-[#113f67]" />,
    "Room service": <Utensils size={16} className="text-[#113f67]" />,
    "Bar/Lounge": <Utensils size={16} className="text-[#113f67]" />,
    "Restaurant": <Utensils size={16} className="text-[#113f67]" />,
    "Outdoor Pool & Bar": <Waves size={16} className="text-[#113f67]" />,
    "Fitness Center": <Dumbbell size={16} className="text-[#113f67]" />,
    "Wi-Fi in Public Areas": <Wifi size={16} className="text-[#113f67]" />
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#113f67]/20 text-[#113f67] hover:bg-[#113f67]/5 hover:border-[#113f67]/40 transition-all duration-300 font-medium"
        >
          <Info className="w-4 h-4 mr-1" />
          View Details
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="h-[95vh] overflow-hidden rounded-b-3xl border-0 shadow-2xl from-white via-blue-50/30 to-indigo-50/20"
      >
        <SheetHeader className="pb-4 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#113f67] to-[#226597] rounded-xl shadow-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-[#113f67]">Room Details</SheetTitle>
              <p className="text-sm text-gray-600">Complete information about this room</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(95vh-120px)] mt-4">
          <div className="px-2 pb-6">
            {/* Mobile-first responsive layout */}
            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8">

              {/* Image Carousel - Full width on mobile, left column on desktop */}
              <div className="lg:col-span-5">
                <div className="sticky top-0 z-10">
                  {images && images.length > 0 ? (
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
                      <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-1"></div>
                      <CardContent className="p-4">
                        <Carousel className="w-full">
                          <CarouselContent>
                            {images.map((item, index) => (
                              <CarouselItem key={index}>
                                <div className="relative">
                                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                                    <img
                                      src={localStorage.getItem('url') + "images/" + item.imagesroommaster_filename}
                                      alt={`Room ${index + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x320?text=Image+Not+Found';
                                      }}
                                    />
                                  </div>
                                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {index + 1} / {images.length}
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-0 shadow-lg" />
                          <CarouselNext className="right-2 bg-white/90 hover:bg-white border-0 shadow-lg" />
                        </Carousel>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <Info className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 font-medium">No images available</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Room Details and Amenities - Right columns */}
              <div className="lg:col-span-7 space-y-6">
                {data ? (
                  <>
                    {/* Room Information Card */}
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
                      <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-1"></div>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          {/* Header */}
                          <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#113f67] mb-3 leading-tight">
                              {data.roomtype_name}
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                              {data.roomtype_description}
                            </p>
                          </div>

                          {/* Room Specifications */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/60">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <span className="text-white font-bold text-sm">₱</span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Price per night</p>
                                <p className="text-lg font-bold text-blue-700">
                                  ₱{Number(data.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/60">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Room Capacity</p>
                                <p className="text-lg font-bold text-blue-700">{data.roomtype_capacity} guests</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/60">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Max Capacity</p>
                                <p className="text-lg font-bold text-blue-700">{data.max_capacity} guests</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/60">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <Bed className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Bed Configuration</p>
                                <p className="text-lg font-bold text-blue-700">{data.roomtype_beds}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/60">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <Maximize className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Room Size</p>
                                <p className="text-lg font-bold text-blue-700">{data.roomtype_sizes}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Amenities Card */}
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
                      <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-1"></div>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-[#113f67] to-[#226597] rounded-xl">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-[#113f67]">Room Amenities</h2>
                              <p className="text-sm text-gray-600">Everything you need for a comfortable stay</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              "Iron / Ironing Board",
                              "Complimentary Bottled Water",
                              "Coffee & Tea Making Amenities",
                              "Electric Water Kettle",
                              "Air Conditioning",
                              "In-room Safe",
                              "Cable TV",
                              "Bidet",
                              "Hot & Cold Shower",
                              "Hair Dryer",
                              "Room service",
                              "Restaurant",
                              "Wi-Fi in Public Areas"
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/80 hover:bg-blue-50/80 rounded-xl transition-all duration-300 group">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300">
                                  {amenityIcons[item] || <Check size={16} className="text-[#113f67]" />}
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-[#113f67] transition-colors duration-300">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Check-in/Check-out and Terms Card */}
                    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
                      <div className="bg-gradient-to-r from-[#113f67] via-[#226597] to-[#2980b9] h-1"></div>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          {/* Check-in/Check-out Times */}
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-gradient-to-r from-[#113f67] to-[#226597] rounded-xl">
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-[#113f67]">Check-in & Check-out</h2>
                                <p className="text-sm text-gray-600">Hotel timing information</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/60">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <h3 className="font-bold text-green-800">CHECK-IN</h3>
                                </div>
                                <p className="text-sm text-green-700 font-medium">From 10:00 AM to 11:00 AM</p>
                              </div>

                              <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200/60">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-red-600" />
                                  <h3 className="font-bold text-red-800">CHECK-OUT</h3>
                                </div>
                                <p className="text-sm text-red-700 font-medium">From 12:00 PM to 1:00 PM</p>
                              </div>
                            </div>
                          </div>

                          {/* Terms and Conditions */}
                          <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/40">
                            <h3 className="text-lg font-bold text-[#113f67] mb-3 flex items-center gap-2">
                              <Info className="w-5 h-5" />
                              Terms and Conditions
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              In preparation for your stay at Demiren Hotel, a comprehensive email containing detailed check-in
                              instructions will be dispatched to you five days prior to your scheduled arrival. Upon your arrival at our establishment,
                              our courteous front desk staff will be on hand to extend a warm welcome and assist with your check-in process. Should you require further
                              information or have specific inquiries regarding your reservation, we kindly invite you to reach out to us using the contact details provided
                              in your booking confirmation. Your comfort and satisfaction are our utmost priorities, and we eagerly anticipate the opportunity to serve you.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <Info className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading room details...</h3>
                        <p className="text-sm text-gray-500">Please wait while we fetch the information</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default Moreinfo