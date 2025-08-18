import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import AdminModal from '@/pages/admin/components/AdminModal';
import { toast } from 'sonner';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
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
import AdminHeader from './components/AdminHeader'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

function AdminDiscountMaster() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

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

  useEffect(() => {
    if (!modalSettings.showModal) {
      getAllDiscounts();
    }
  }, [modalSettings.showModal]);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen bg-white/30 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-center">Loading...</h1>
        </div>
      ) : (
        <>
          <AdminHeader />
          <div>
            <div className="m-2 mb-4 bg-blue-600">
              <div className="flex grid grid-cols-8 ps-2 justify-items-center">
                <div className="bg-red-500">ID</div>
                <div className="col-span-2 bg-red-600">Discount Type</div>
                <div className="bg-red-700">Discount Start</div>
                <div className="bg-red-800">Discount End</div>
                <div className="bg-red-900">Discount Percent</div>
                <div className="col-start-8 bg-red-400">
                  <Button onClick={() => popAddModal()}>Add New Discount</Button>
                </div>
              </div>
            </div>

            <div className="border-2 rounded-lg border-red-400 m-2 p-4">
              <ScrollArea className=" h-[500px]">
                <Table>
                  <TableCaption>A list of your recent invoices.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead >Discount ID</TableHead>
                      <TableHead>Discount Type</TableHead>
                      <TableHead>Date Started</TableHead>
                      <TableHead >Date Ending</TableHead>
                      <TableHead >Discount Percent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDiscounts.map((allDisc, index) => (
                      <TableRow key={index}>
                        <TableCell>{allDisc.discounts_id}</TableCell>
                        <TableCell>{allDisc.discounts_type}</TableCell>
                        <TableCell>{formatDate(allDisc.discounts_datestart)}</TableCell>
                        <TableCell>{formatDate(allDisc.discounts_dateend)}</TableCell>
                        <TableCell>{allDisc.discounts_percent}%</TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">Actions</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-2 space-y-2">
                              <Button variant="secondary" className="w-full" onClick={() => popUpdateModal(allDisc)}>Update</Button>
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

export default AdminDiscountMaster;