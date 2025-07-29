import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import axios from 'axios'
import { Bed, Info, Square, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import ViewRooms from './modals/sheets/ViewRooms'
import LandingHeader from '@/components/layout/LandingHeader'

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
      <LandingHeader />

      <section className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-fixed bg-no-repeat text-white px-4"
        style={{ backgroundImage: 'url("/assets/images/hotels.jpg")' }}
      >
        <h1 className="text-4xl font-bold">Rooms</h1>
      </section>


      <section className="flex items-center justify-center py-20 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10 p-5">
          {rooms.filter((room) => room.status_id === 3).length === 0 ? (
            <p>No rooms available</p>
          ) : (
            rooms
              .filter((room) => room.status_id === 3)
              .map((room, index) => (

                <Card key={index} className="flex flex-col w-full h-[435px] shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <CardHeader>
                    <img src={room.roomtype_image} alt="Room" className="w-full h-48 object-cover" />
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-lg font-semibold">{room.roomtype_name}</h5>

                    </div>
                    <div>
                      <h5>{room.roomtype_description}</h5>

                    </div>

                    <div>
                      {/* Top row badges */}
                      <div className="flex flex-row gap-4 mb-7">
                        <div className="bg-secondary rounded-full p-2 flex items-center gap-1.5 w-fit">
                          <User className="w-4 h-4" />
                          <h3 className="text-sm">3 Guests</h3>
                        </div>
                        <div className="bg-secondary rounded-full p-2 flex items-center gap-1.5 w-fit">
                          <Square className="w-4 h-4" />
                          <h3 className="text-sm">23 m2</h3>
                        </div>
                      </div>

                      {/* Separate badge below */}
                      <div className="bg-secondary rounded-full p-2 flex items-center gap-1.5 w-fit mb-3">
                        <Bed className="w-4 h-4" />
                        <h3 className="text-sm">2 Beds</h3>
                      </div>
                    </div>

                    <ViewRooms room={room} />






                  </CardContent>



                </Card>

              ))
          )}

        </div>





      </section>
    </div>
  )
}

export default CustomerRooms