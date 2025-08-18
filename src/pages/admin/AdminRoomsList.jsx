import React, { useEffect, useState } from 'react'
import axios from 'axios'

// Card Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Carousel Components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import AdminHeader from './components/AdminHeader'

function AdminRoomsList() {
  const APIConn = `${localStorage.url}admin.php`

  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const getRooms = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("method", "viewRooms")

    try {
      const conn = await axios.post(APIConn, formData)
      if (conn.data) {
        console.log('API response:', conn.data)
        setRooms(conn.data !== 0 ? conn.data : [])
      } else {
        console.log("No data has been fetched...")
      }
    } catch (err) {
      console.log('Cannot Find API...', err)
    } finally {
      console.log('Content is Done...')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
  }, [])

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <AdminHeader />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-red-500 p-4">
            {rooms.map((room, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{room.roomtype_name}</CardTitle>
                  <CardDescription>Price: {room.roomtype_price}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="flex-1 space-y-1">
                      <Carousel className="w-full max-w-xs">
                        <CarouselContent>
                          {!room.images ? (
                            <p className="text-sm text-gray-500 text-center">No Images Present</p>
                          ) : (
                            room.images.split(",").map((imageName, idx) => (
                              <CarouselItem key={idx}>
                                <div className="p-1">
                                  <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                      <img
                                        src={`${localStorage.url}images/${imageName}`}
                                        alt={`Room image ${idx + 1}`}
                                        className="object-cover w-full h-full rounded-lg"
                                      />
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            ))
                          )}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  </div>
                </CardContent>
                <CardFooter></CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default AdminRoomsList
