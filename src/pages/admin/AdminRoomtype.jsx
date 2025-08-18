import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import AdminModal from '@/pages/admin/components/AdminModal';

import { toast } from 'sonner';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Pencil, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import AdminHeader from './components/AdminHeader'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

const formSchema = z.object({
  roomType_name: z.string().min(1).max(20, {
    message: "Please Input Room Name"
  }),
  roomType_price: z.string().min(1).max(10, {
    message: "Input Price Here..."
  }),
  roomType_desc: z.string().min(10, {
    message: "Missing Room Description"
  })
})

function AdminRoomtype() {
  const APIConn = `${localStorage.url}admin.php`;
  const [isLoading, setIsLoading] = useState(false);

  // --------- Datas --------- //
  const [roomsType, setRoomsType] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomType_name: '',
      roomType_price: '',
      roomType_desc: ''
    },
  });

  // --------- Modal Functions --------- //
  const [modalSettings, setModalSettings] = useState({
    showModal: false,
    modalMode: ""
  });

  const popAddRoomType = () => {
    setModalSettings({
      showModal: true,
      modalMode: "add"
    });
  }

  const popUpdateRoomType = (roomAssets) => {
    console.log("Got the Update Details", roomAssets);

    const formattedData = {
      roomType_name: roomAssets.roomtype_name,
      roomType_price: roomAssets.roomtype_price,
      roomType_desc: roomAssets.roomtype_description
    }
    setSelectedRoom({
      room_id: roomAssets.roomtype_id,
      ...formattedData
    });
    form.reset(formattedData);

    setModalSettings({
      showModal: true,
      modalMode: "update"
    });
  }

  const popDeleteRoomType = () => {

  }

  // --------- API Connections --------- //
  const getRoomTypes = async () => {
    setIsLoading(true);
    const formData = new FormData();
    // formData.append("json", JSON.stringify(jsonData));
    formData.append("method", "view_room_types");

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        toast("Connection Successful!!!");
        setRoomsType(conn.data !== 0 ? conn.data : [])
      } else {
        toast("No data has been fetched...");
      }

    } catch (err) {
      console.log('Cannot Find API...', err)
    } finally {
      console.log('Content is Done...');
      setIsLoading(false);
    }

  }

  const addRoomTypes = async (values) => {
    setIsLoading(true);

    const jsonData = {
      room_name: values.roomType_name,
      room_price: parseFloat(values.roomType_price),
      room_desc: values.roomType_desc,
    }

    const formData = new FormData();
    formData.append("method", "add_room_types");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        toast("Connection Successful!!!");
        setRoomsType(conn.data !== 0 ? conn.data : [])
      } else {
        toast("No data has been fetched...");
      }

    } catch (err) {
      console.log('Cannot Find API...', err)
    } finally {
      console.log('Content is Done...');
      setIsLoading(false);
    }
  }

  const updRoomTypes = async (values) => {
    setIsLoading(true);
    console.log("Successfully Updated the following! ", selectedRoom.room_id, values);

    const jsonData = {
      roomtype_id: selectedRoom.room_id,
      roomtype_name: values.roomType_name,
      roomtype_description: values.roomType_desc,
      roomtype_price: parseFloat(values.roomType_price)
    };

    const formData = new FormData();
    formData.append("method", "update_room_types");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        toast("Updated Successfully!!!");
      } else {
        toast("No data has been fetched...");
      }
    } catch (err) {
      toast('Cannot Find API...', err)
    } finally {
      toast('Content is Done...');
      resetStates();
    }
  }

  const delRoomType = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("method", "view_room_types");
    // formData.append("json", JSON.stringify(jsonData));

    // try {
    //   const conn = await axios.post(APIConn, formData);
    //   if (conn.data) {
    //     toast("Connection Successful!!!");
    //     setRoomsType(conn.data !== 0 ? conn.data : [])
    //   } else {
    //     toast("No data has been fetched...");
    //   }

    // } catch (err) {
    //   console.log('Cannot Find API...', err)
    // } finally {
    //   console.log('Content is Done...');
    //   setIsLoading(false);
    // }
  }

  // --------- Other Functions --------- //
  const resetStates = () => {
    setModalSettings({
      showModal: false,
      modalMode: ""
    });
    setIsLoading(false);
  }

  useEffect(() => {
    if (!modalSettings.showModal) {
      getRoomTypes();
      console.log(roomsType);
    }
  }, [modalSettings.showModal])


  return (
    <>
      {isLoading ?
        <>
          <div className="flex items-center justify-center h-screen bg-white/30 backdrop-blur-sm">
            <h1 className="text-3xl font-bold text-center">Loading...</h1>
          </div>
        </>
        :
        <>
          <AdminHeader />
          <div>

            <div className="flex bg-blue justify-end col-start-6">
              <button className="flex m-2 p-1 items-left bg-[#05153d] rounded-lg hover:bg-[#1a2e47] items-center"
                onClick={() => popAddRoomType()}>
                Add Charge Category
              </button>
            </div>

            <ScrollArea className="border-4 rounded-md border-sky-500 h-[500px]">

              <Table className="m-2">
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Room ID</TableHead>
                    <TableHead className="w-[150px]">Room Name</TableHead>
                    <TableHead className="w-[250px]">Room Description</TableHead>
                    <TableHead className="text-right w-[100px]">Amount</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomsType.map((rooms, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rooms.roomtype_id}</TableCell>
                      <TableCell>{rooms.roomtype_name}</TableCell>
                      <TableCell className="truncate max-w-[250px]">
                        {rooms.roomtype_description}
                      </TableCell>
                      <TableCell className="text-right">{rooms.roomtype_price}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Actions</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2 space-y-2">
                            <Button variant="secondary" className="w-full" onClick={() => popUpdateRoomType(rooms)}>Update</Button>
                            <Button variant="destructive" className="w-full">Delete</Button>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </ScrollArea>
          </div>

          <AdminModal isVisible={modalSettings.showModal}
            onClose={
              () => setModalSettings({
                showModal: false,
                modalMode: ""
              })}
            modalTitle={
              modalSettings.modalMode === "add" ? "Add Room New Type" :
                modalSettings.modalMode === "update" ? "Update Current Room" : "Remove Room Type"
            }>

            {modalSettings.modalMode === 'add' && (
              <>
                <div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(addRoomTypes)} className="space-y-8">
                      <div className="flex grid-rows-2 place-content-between">
                        <FormField
                          control={form.control}
                          name="roomType_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Type Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Room Here..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="roomType_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Price</FormLabel>
                              <FormControl>
                                <Input placeholder="Room Price Here..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>


                      <FormField
                        control={form.control}
                        name="roomType_desc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Desciption</FormLabel>
                            <FormControl>
                              <Textarea className="w-full h-64 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your message here." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit">Submit</Button>
                    </form>
                  </Form>
                </div>
              </>
            )}

            {modalSettings.modalMode === 'update' && selectedRoom && (
              <>
                <div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(updRoomTypes)} className="space-y-8">
                      <div className="flex grid-rows-2 place-content-between">
                        <FormField
                          control={form.control}
                          name="roomType_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Type Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Room Here..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="roomType_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Price</FormLabel>
                              <FormControl>
                                <Input placeholder="Room Price Here..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>


                      <FormField
                        control={form.control}
                        name="roomType_desc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Desciption</FormLabel>
                            <FormControl>
                              <Textarea className="w-full h-64 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your message here." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit">Submit</Button>
                    </form>
                  </Form>
                </div>
              </>
            )}

          </AdminModal>

        </>
      }
    </>
  )
}

export default AdminRoomtype