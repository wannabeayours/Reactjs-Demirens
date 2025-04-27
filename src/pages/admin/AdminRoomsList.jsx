import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

function AdminRoomsList() {

    const baseURL = sessionStorage.getItem('url');
    const adminURL = `${baseURL}admin.php`;
  
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
  
  
    const getRooms = async () => {
      setIsLoading(true);
      const formData = new FormData();
      // formData.append("json", JSON.stringify(jsonData));
      formData.append("method", "view_rooms");
      console.log(adminURL);
  
      try {
        const conn = await axios.post(adminURL, formData);
        console.log(conn.data)
        setRooms(conn.data !== 0 ? conn.data : []);
        console.log('Rooms: ', rooms);
      } catch (err) {
        console.log('Cannot Find API...', err)
      } finally {
        console.log('Content is Done...');
        setIsLoading(false);
      }
  
    }
  
    useEffect(() => {
      getRooms();
    }, [])
  
  return (
    <>
    {isLoading ? <p>loading...</p> : <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-red-500">
        {rooms.map((room, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{room.roomtype_name}</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className=" flex items-center space-x-4 rounded-md border p-4">

                <div className="flex-1 space-y-1">

                  <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-4xl font-semibold">{index + 1}</span>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>

                </div>

              </div>
              <div>

              </div>
            </CardContent>
            <CardFooter>

            </CardFooter>
          </Card>
        ))}

      </div>
    </>}

  </>

  )
}

export default AdminRoomsList