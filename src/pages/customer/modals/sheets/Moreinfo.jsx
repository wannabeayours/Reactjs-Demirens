import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import axios from 'axios'
import { Check } from 'lucide-react'
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
          formData.append("json", JSON.stringify({ roomTypeId: room.room_type }));
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <span className="underline cursor-pointer">More Info</span>
      </SheetTrigger>
      <SheetContent side="top" className="h-[90vh] overflow-y-auto rounded-b-3xl">
        <ScrollArea className="h-[100vh] md:h-[90)]">
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 w-full">
              {/* Left Column: Carousel */}
              <div className="flex justify-center w-full">
                {images && images.length > 0 ? (
                  <div className="w-full max-w-md">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((item, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex items-center justify-center p-2">
                                  <div className="w-full h-80 overflow-hidden rounded-lg">
                                    <img
                                      src={localStorage.getItem('url') + "images/" + item.imagesroommaster_filename}
                                      alt={`Room ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x320?text=Image+Not+Found';
                                      }}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="ml-4" />
                      <CarouselNext className="mr-4" />
                    </Carousel>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-80 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Middle Column: Room Details + Amenities */}
              <div className="flex flex-col justify-start items-start space-y-6 p-4 w-full rounded-2xl">
                {data ? (
                  <>
                    <div className="text-start">
                      <h1 className="text-3xl font-bold font-playfair text-blue-800">{data.roomtype_name}</h1>
                      <p className="text-base text-black mb-4">{data.roomtype_description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full text-sm">
                        <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">₱ {Number(data.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })} /night</h3></div>
                        <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Room capacity: {data.roomtype_capacity}</h3></div>
                        <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Max Capacity: {data.max_capacity}</h3></div>
                        <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Beds: {data.roomtype_beds}</h3></div>
                        <div><h3 className="px-2 py-2 rounded-full border border-blue-800 text-blue-800">Room size: {data.roomtype_sizes}</h3></div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                      {[
                        "Iron / Ironing Board",
                        "Complimentary Bottled Water",
                        "Coffee & Tea Making Amenities",
                        "Electric Water Kettle",
                        "Mini Bar",
                        "Air Conditioning",
                        "In-room Safe",
                        "Cable TV",
                        "Bidet",
                        "Hot & Cold Shower",
                        "Hot & Cold Bathtub",
                        "Hair Dryer",
                        "Room service",
                        "Bar/Lounge",
                        "Restaurant",
                        "Outdoor Pool & Bar",
                        "Fitness Center",
                        "Wi-Fi in Public Areas"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check size={16} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>Loading room details...</p>
                )}
              </div>

              {/* Right Column: Check-in / Terms */}
              <div className="space-y-6 text-sm rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 gap-y-12 w-[71%] mt-10">
                  <div>
                    <h1 className="text-blue-800 font-bold">CHECK-IN</h1>
                    <div className="flex items-center gap-2">
                      <Check size={20} />
                      <h1>From 10:00 AM to 11:00 AM</h1>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-blue-800 font-bold">CHECK-OUT</h1>
                    <div className="flex items-center gap-2">
                      <Check size={20} />
                      <h1>From 12:00 PM to 1:00 PM</h1>
                    </div>
                  </div>
                </div>

                <div>
                  <h1 className="font-bold font-playfair">TERMS AND CONDITIONS</h1>
                  <h2>In preparation for your stay at Demiren Hotel, a comprehensive email containing detailed check-in
                    instructions will be dispatched to you five days prior to your scheduled arrival. Upon your arrival at our establishment,
                    our courteous front desk staff will be on hand to extend a warm welcome and assist with your check-in process. Should you require further
                    information or have specific inquiries regarding your reservation, we kindly invite you to reach out to us using the contact details provided
                    in your booking confirmation. Your comfort and satisfaction are our utmost priorities, and we eagerly anticipate the opportunity to serve you.</h2>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default Moreinfo