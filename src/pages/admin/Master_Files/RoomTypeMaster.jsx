import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
  roomType_price: z.string()
    .min(1, "Price is required")
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .refine((val) => parseFloat(val) > 0, "Price must be greater than 0"),
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
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomType_name: '',
      roomType_price: '',
      roomType_desc: ''
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("method", "viewRoomTypes");

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        setRoomsType(conn.data !== 0 ? conn.data : []);
      }
    } catch (err) {
      console.log('Cannot Find API...', err);
    } finally {
      setIsLoading(false);
    }
  };

  const popAddRoomType = () => {
    setShowModal(true);
    setModalMode("add");
    setSelectedRoom(null);
    form.reset();
  };

  const popUpdateRoomType = (roomAssets) => {
    const formattedData = {
      roomType_name: roomAssets.roomtype_name,
      roomType_price: roomAssets.roomtype_price.toString(),
      roomType_desc: roomAssets.roomtype_description
    };
    
    setSelectedRoom({
      room_id: roomAssets.roomtype_id,
      ...formattedData
    });
    
    form.reset(formattedData);
    setShowModal(true);
    setModalMode("update");
  };

  const addRoomTypes = async (values) => {
    setIsLoading(true);

    const jsonData = {
      roomtype_name: values.roomType_name,
      roomtype_description: values.roomType_desc,
      roomtype_price: parseFloat(values.roomType_price),
      max_capacity: 4, // Default value
      roomtype_beds: 1, // Default value  
      roomtype_capacity: 2, // Default value
      roomtype_sizes: "Standard" // Default value
    };

    const formData = new FormData();
    formData.append("method", "addRoomTypes");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        toast("Successfully added room type!");
        resetModal();
        loadRoomTypes(); // Reload data
      } else {
        toast("Failed to add room type");
      }
    } catch (err) {
      console.log('Cannot Find API...', err);
      toast("Failed to add room type");
    } finally {
      setIsLoading(false);
    }
  };

  const updRoomTypes = async (values) => {
    setIsLoading(true);

    const jsonData = {
      roomtype_id: selectedRoom.room_id,
      roomtype_name: values.roomType_name,
      roomtype_description: values.roomType_desc,
      roomtype_price: parseFloat(values.roomType_price)
    };

    const formData = new FormData();
    formData.append("method", "updateRoomTypes");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        toast("Updated Successfully!!!");
        resetModal();
        loadRoomTypes(); // Reload data
      } else {
        toast("Failed to update room type");
      }
    } catch (err) {
      toast('Cannot Find API...', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoomType = async () => {
    if (!selectedRoom) return;
    
    setIsLoading(true);
    const jsonData = {
      roomtype_id: selectedRoom.room_id
    };
    
    const formData = new FormData();
    formData.append("method", "disableRoomTypes");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully deleted room type");
        resetModal();
        loadRoomTypes();
      } else {
        toast("Failed to delete room type");
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
      toast("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const popDeleteModal = (room) => {
    setModalMode('delete');
    setSelectedRoom({
      room_id: room.roomtype_id,
      roomName: room.roomtype_name
    });
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setModalMode("");
    setSelectedRoom(null);
    form.reset();
  };

  // Filter room types based on search term
  const filteredRoomTypes = roomsType.filter(room =>
    room.roomtype_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomtype_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen bg-white/30 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-center">Loading...</h1>
        </div>
      ) : (
        <>
          <AdminHeader onCollapse={setIsCollapsed} />
          <div className={`transition-all duration-300 ${isCollapsed ? 'ml-0' : 'lg:ml-72'} p-6`}>
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
                                        onClick={() => popDeleteModal(room)}
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

          <AdminModal 
            isVisible={showModal}
            onClose={resetModal}
            modalTitle={
              modalMode === "add" ? "Add Room New Type" :
              modalMode === "update" ? "Update Current Room" : "Remove Room Type"
            }
          >
            {modalMode === 'add' && (
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
                              <Input 
                                type="text"
                                placeholder="Room Price Here..." 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow only numbers and decimal point
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    field.onChange(value);
                                  }
                                }}
                              />
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
                          <FormLabel>Room Description</FormLabel>
                          <FormControl>
                            <Textarea className="w-full h-64 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Type your message here." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>Submit</Button>
                  </form>
                </Form>
              </div>
            )}

            {modalMode === 'update' && selectedRoom && (
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
                              <Input 
                                type="text"
                                placeholder="Room Price Here..." 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow only numbers and decimal point
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    field.onChange(value);
                                  }
                                }}
                              />
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
                          <FormLabel>Room Description</FormLabel>
                          <FormControl>
                            <Textarea className="w-full h-64 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Type your message here." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>Submit</Button>
                  </form>
                </Form>
              </div>
            )}

            {modalMode === 'delete' && selectedRoom && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Room Type</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete <strong>"{selectedRoom.roomName}"</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteRoomType} disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Room Type
                  </Button>
                </div>
              </div>
            )}
          </AdminModal>
        </>
      )}
    </>
  )
}

export default RoomTypeMaster