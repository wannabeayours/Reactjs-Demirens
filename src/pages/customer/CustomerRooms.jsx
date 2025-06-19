import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import axios from 'axios'
import { Bed, Info, Square, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

function CustomerRooms() {
  const [rooms, setRooms] = useState([]);
  const getRooms = async () => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const formData = new FormData();
      formData.append("operation", "getRooms");
      const res = await axios.post(url, formData);
      console.log("res ni getRooms", res);
      setRooms(res.data !== 0 ? res.data : {});
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }
  useEffect(() => {
    getRooms();
  }, []);
  return (
    <div>

      <section className="flex items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold">Rooms</h1>
      </section>


      <section className="flex items-center justify-center py-20 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10 p-5">
          {rooms.length === 0 ? <p>No rooms available</p> : rooms.map((room, index) => (
            <Card key={index} className="flex flex-col h-full shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <img src={room.roomtype_image} alt="Room" className="w-full h-48 object-cover" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-lg font-semibold">{room.roomtype_name}</h5>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant={room.status_id === 3 ? "default" : "destructive"} >{room.status_name}</Badge>
                  </div>
                </div>
                <div>
                  <h5>{room.roomtype_description}</h5>
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
                </div>
                <div className="mb-6 mt-6" >
                  <h2 className="text-lg font-semibold text-blue-600">₱ {room.roomtype_price}</h2>
                </div>
                <div>
                  {/* Top row badges */}
                  <div className="flex flex-row gap-4 mb-3">
                    <div className="bg-blue-100 rounded-full p-2 flex items-center gap-1.5 w-fit">
                      <User className="w-4 h-4" />
                      <h3 className="text-sm">3 Guests</h3>
                    </div>
                    <div className="bg-blue-100 rounded-full p-2 flex items-center gap-1.5 w-fit">
                      <Square className="w-4 h-4" />
                      <h3 className="text-sm">23 m2</h3>
                    </div>
                  </div>

                  {/* Separate badge below */}
                  <div className="bg-blue-100 rounded-full p-2 flex items-center gap-1.5 w-fit mb-3">
                    <Bed className="w-4 h-4" />
                    <h3 className="text-sm">2 Beds</h3>
                  </div>
                </div>

                <div className="mt-auto">

                  <Button className="w-full text-lg py-2" disabled={room.status_id !== 3}>Book Now</Button>

                </div>

              </CardContent>
            </Card>
          ))}
        </div>





      </section>
    </div>
  )
}

export default CustomerRooms