import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import AdminModal from '@/pages/admin/components/AdminModal';

import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash, Search, Filter, MoreHorizontal, Edit, Trash2, Bed, DollarSign, FileText } from 'lucide-react';
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
import AdminHeader from '../components/AdminHeader'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

function RoomTypeMaster() {
  const APIConn = `${localStorage.url}admin.php`;
  const [isLoading, setIsLoading] = useState(false);

  // --------- Datas --------- //
  const [roomsType, setRoomsType] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Filter room types based on search term
  const filteredRoomTypes = roomsType.filter(room =>
    room.roomtype_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomtype_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <AdminHeader onCollapse={setIsCollapsed} />
          <div className={`transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-0'} p-6`}>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Room Type Management</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage hotel room types and pricing
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => popAddRoomType()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  >
                    <Bed className="w-4 h-4 mr-2" />
                    Add Room Type
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Search and Filter Bar */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search room types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="px-4">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Room Types</p>
                          <p className="text-2xl font-bold text-indigo-600">{roomsType.length}</p>
                        </div>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                          <Bed className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Types</p>
                          <p className="text-2xl font-bold text-green-600">{filteredRoomTypes.length}</p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Price</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${roomsType.length > 0 
                              ? Math.round(roomsType.reduce((sum, room) => sum + parseFloat(room.roomtype_price), 0) / roomsType.length)
                              : 0}
                          </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtered Results</p>
                          <p className="text-2xl font-bold text-purple-600">{filteredRoomTypes.length}</p>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <Search className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Table */}
                <Card className="border-0 shadow-sm">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                        <TableRow>
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Room Name</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold text-right">Price</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRoomTypes.length > 0 ? (
                          filteredRoomTypes.map((room, index) => (
                            <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <TableCell className="font-medium">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                  #{room.roomtype_id}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{room.roomtype_name}</TableCell>
                              <TableCell className="max-w-[300px]">
                                <div className="truncate" title={room.roomtype_description}>
                                  {room.roomtype_description}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                  ${room.roomtype_price}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                  Active
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48 p-2" align="end">
                                    <div className="space-y-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start"
                                        onClick={() => popUpdateRoomType(room)}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              {searchTerm ? 'No room types found matching your search.' : 'No room types available.'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </Card>
              </CardContent>
            </Card>
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

export default RoomTypeMaster