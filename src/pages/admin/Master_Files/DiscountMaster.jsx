import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import AdminModal from '@/pages/admin/components/AdminModal';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminHeader from '../components/AdminHeader'
import { Search, Filter, MoreHorizontal, Edit, Trash2, Percent, Calendar, DollarSign } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

function DiscountMaster() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formSchema = z.object({
    discountType: z.string().min(1, 'Required'),
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
    discountPercent: z.string().min(1, 'Required'),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountType: '',
      startDate: '',
      endDate: '',
      discountPercent: '',
    },
  });

  // --------- For Modal --------- //
  const [modalSettings, setModalSettings] = useState({
    modalMode: '',
    showModal: false,
  });

  const popAddModal = () => {
    setModalSettings({
      modalMode: 'add',
      showModal: true,
    });
  };

  const popUpdateModal = (discountData) => {
    console.log("From Update MOdal:", discountData);
    const formattedData = {
      discountType: discountData.discounts_type,
      startDate: discountData.discounts_datestart,
      endDate: discountData.discounts_dateend,
      discountPercent: discountData.discounts_percent
    }
    setSelectedDiscount({
      discount_id: discountData.discounts_id,
      ...formattedData
    });

    form.reset(formattedData);

    setModalSettings({
      showModal: true,
      modalMode: "update"
    })
  };

  // --------- API Connections --------- //
  const getAllDiscounts = async () => {
    setIsLoading(true);
    const reqFormDiscounts = new FormData();
    reqFormDiscounts.append('method', 'view_discount');

    try {
      const conn = await axios.post(APIConn, reqFormDiscounts);
      if (conn.data) {
        setAllDiscounts(conn.data !== 0 ? conn.data : []);

        // Find a Way to only call this once and only call it when something is either added, updated or deleted do the 
        // same thing for the other master files in order to avoid wasting API Calls
        // console.log("FetchData", conn.data);

      } else {
        console.log('No data has been fetched...');
      }
    } catch (err) {
      toast('Failed Connection... ');
    } finally {
      toast('Content is Done...');
      setIsLoading(false);
    }
  };

  const addNewDiscounts = async (discountData) => {
    setIsLoading(true);
    const addDiscountForm = new FormData();
    addDiscountForm.append("method", "add_discount");
    addDiscountForm.append("json", JSON.stringify(discountData));

    console.log("Send this data to API", addDiscountForm);

    try {
      const conn = await axios.post(APIConn, addDiscountForm);
      if (conn.data === 1) {
        toast("Added New Discount!");
      }
    } catch (err) {
      toast("Failed to Add Discount...");
    } finally {
      resetStates();
      toast("Content is Done");
    }
  }

  const updateDiscounts = async (discountValues) => {
    setIsLoading(false);
    const jsonData = {
      discounts_id: selectedDiscount.discount_id,
      discount_type: discountValues.discountType,
      discount_startDate: discountValues.startDate,
      discount_endDate: discountValues.endDate,
      discount_percent: parseInt(discountValues.discountPercent)
    }

    const updateDiscForm = new FormData();
    updateDiscForm.append("method", "update_discount");
    updateDiscForm.append("json", JSON.stringify(jsonData));

    console.log("Get this only: ", updateDiscForm);

    try {
      const conn = await axios.post(APIConn, updateDiscForm);
      if (conn.data === 1) {
        toast("Successfully Updated!");
      } else {
        toast("Failed to update...");
      }
    } catch (err) {
      toast("Cannot connect to API...");
    } finally {
      resetStates();
      setIsLoading(false);
      toast("Content Loaded");
    }
  }

  // --------- Other Functions --------- //
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const resetStates = () => {
    setModalSettings({
      modalMode: "",
      showModal: false
    })
    form.reset();
    setIsLoading(false);
  }

  // Filter discounts based on search term
  const filteredDiscounts = allDiscounts.filter(discount =>
    discount.discounts_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!modalSettings.showModal) {
      getAllDiscounts();
    }
  }, [modalSettings.showModal, getAllDiscounts]);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen bg-white/30 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-center">Loading...</h1>
        </div>
      ) : (
        <>
          <AdminHeader onCollapse={setIsCollapsed} />
          <div className={`transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-0'} p-6`}>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Discount Management</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage hotel discounts and promotions
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => popAddModal()}
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    Add Discount
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Search and Filter Bar */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search discounts..."
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
                  <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Discounts</p>
                          <p className="text-2xl font-bold text-orange-600">{allDiscounts.length}</p>
                        </div>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                          <Percent className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Discounts</p>
                          <p className="text-2xl font-bold text-blue-600">{filteredDiscounts.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Discount</p>
                          <p className="text-2xl font-bold text-green-600">
                            {allDiscounts.length > 0 
                              ? Math.round(allDiscounts.reduce((sum, disc) => sum + disc.discounts_percent, 0) / allDiscounts.length)
                              : 0}%
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtered Results</p>
                          <p className="text-2xl font-bold text-purple-600">{filteredDiscounts.length}</p>
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
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Start Date</TableHead>
                          <TableHead className="font-semibold">End Date</TableHead>
                          <TableHead className="font-semibold text-center">Discount %</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDiscounts.length > 0 ? (
                          filteredDiscounts.map((discount, index) => {
                            const isActive = new Date() >= new Date(discount.discounts_datestart) && 
                                           new Date() <= new Date(discount.discounts_dateend);
                            return (
                              <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="font-medium">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                    #{discount.discounts_id}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{discount.discounts_type}</TableCell>
                                <TableCell>{formatDate(discount.discounts_datestart)}</TableCell>
                                <TableCell>{formatDate(discount.discounts_dateend)}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                    {discount.discounts_percent}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant={isActive ? "default" : "secondary"}
                                    className={isActive 
                                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                                    }
                                  >
                                    {isActive ? 'Active' : 'Inactive'}
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
                                          onClick={() => popUpdateModal(discount)}
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
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              {searchTerm ? 'No discounts found matching your search.' : 'No discounts available.'}
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
            isVisible={modalSettings.showModal}
            onClose={() =>
              setModalSettings({
                modalMode: '',
                showModal: false,
              })
            }
            modalTitle={
              modalSettings.modalMode === 'add'
                ? 'Add new Discount'
                : modalSettings.modalMode === 'update'
                  ? 'Update Existing Discount'
                  : 'Remove Discount'
            }
          >
            {modalSettings.modalMode === 'add' && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => addNewDiscounts(values))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Type of discount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percent</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            )}

            {modalSettings.modalMode === 'update' && selectedDiscount && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    updateDiscounts(values);
                  })}
                  className="space-y-4"
                >
                  {/* Discount Type */}
                  <FormField
                    control={form.control}
                    name="discountType"
                    defaultValue={selectedDiscount.discountType}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    defaultValue={selectedDiscount.startDate}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    defaultValue={selectedDiscount.endDate}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Discount Percent */}
                  <FormField
                    control={form.control}
                    name="discountPercent"
                    defaultValue={selectedDiscount.discountPercent}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percent</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Update
                  </Button>
                </form>
              </Form>
            )}


            {modalSettings.modalMode === 'delete' && <>This is where to delete!</>}
          </AdminModal>
        </>
      )}
    </>
  );
}

export default DiscountMaster;
