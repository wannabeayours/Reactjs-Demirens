import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'

const ChooseRooms = () => {
  const APIConn = `${localStorage.url}front-desk.php`;
  const [rooms, setRooms] = useState([]);
  const [roomsList, setRoomsList] = useState([]);

  const getRooms = async () => {
    const APIConn = `${localStorage.url}front-desk.php`
    const roomListReq = new FormData();
    roomListReq.append('method', 'viewRooms');

    try {
      const conn = await axios.post(APIConn, roomListReq);
      console.log(conn.data)
    } catch (err) {
      toast("Error: Cannot Fetch API");
    }
  }

  useEffect(() => {
    getRooms();
  }, [])
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Add Room</Button>
        </SheetTrigger>
        <SheetContent side='bottom' className='w-full max-w-[700px] mx-auto rounded-t-xl'>
          <SheetHeader>
            <SheetTitle>Select a Room</SheetTitle>
            <SheetDescription>

              <div className='border rounded-md'>
                {
                  roomsList?.length === 0 ? <p className='m-8 p-6 text-center'>No Rooms Here</p> :

                    roomsList.map(() => {
                      <Card className='m-4 p-2'>
                        <CardContent>
                          <p>This is a Card</p>
                        </CardContent>
                      </Card>
                    })

                }
              </div>

            </SheetDescription>
          </SheetHeader>
          {/* Room selection logic here */}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ChooseRooms