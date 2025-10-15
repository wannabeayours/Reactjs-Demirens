import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminHeader from '../components/AdminHeader'
import { Search, Filter, MoreHorizontal, Edit, Trash2, Percent, Calendar, DollarSign as DollarSignIcon } from 'lucide-react';
import DateFormatter from '@/pages/admin/Function_Files/DateFormatter';

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
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");

  const formSchema = z.object({
    discountName: z.string().min(1, 'Required'),
    discountPercentage: z.string().optional(),
    discountAmount: z.string().optional(),
    discountDescription: z.string().optional(),
    discountStartIn: z.string().optional(),
    discountEndsIn: z.string().optional(),
  }).refine((data) => data.discountPercentage || data.discountAmount, {
    message: "Either percentage or amount is required",
    path: ["discountPercentage"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountName: '',
      discountPercentage: '',
      discountAmount: '',
      discountDescription: '',
      discountStartIn: '',
      discountEndsIn: '',
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    setIsLoading(true);
    const reqFormDiscounts = new FormData();
    reqFormDiscounts.append('method', 'viewDiscounts');

    try {
      const conn = await axios.post(APIConn, reqFormDiscounts);
      if (conn.data) {
        setAllDiscounts(conn.data !== 0 ? conn.data : []);
      }
    } catch (err) {
      toast('Failed to load discounts');
    } finally {
      setIsLoading(false);
    }
  };

  const popAddModal = () => {
    setModalMode('add');
    setSelectedDiscount(null);
    form.reset();
    setShowModal(true);
  };

  const popUpdateModal = (discountData) => {
    const formattedData = {
      discountName: discountData.discounts_name,
      discountPercentage: discountData.discounts_percentage?.toString() || '',
      discountAmount: discountData.discounts_amount?.toString() || '',
      discountDescription: discountData.discounts_description || '',
      discountStartIn: discountData.discount_start_in || '',
      discountEndsIn: discountData.discount_ends_in || '',
    };
    
    setSelectedDiscount({
      discount_id: discountData.discounts_id,
      ...formattedData
    });

    form.reset(formattedData);
    setModalMode("update");
    setShowModal(true);
  };

  const addNewDiscounts = async (discountData) => {
    setIsLoading(true);
    const addDiscountForm = new FormData();
    addDiscountForm.append("method", "addDiscounts");
    addDiscountForm.append("json", JSON.stringify(discountData));

    try {
      const conn = await axios.post(APIConn, addDiscountForm);
      if (conn.data === 1) {
        toast("Added New Discount!");
        resetModal();
        loadDiscounts(); // Reload data
      } else {
        toast("Failed to add discount");
      }
    } catch (err) {
      toast("Failed to Add Discount...");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiscounts = async (discountValues) => {
    setIsLoading(true);
    const jsonData = {
      discount_id: selectedDiscount.discount_id,
      discountName: discountValues.discountName,
      discountPercentage: discountValues.discountPercentage ? parseFloat(discountValues.discountPercentage) : null,
      discountAmount: discountValues.discountAmount ? parseInt(discountValues.discountAmount) : null,
      discountDescription: discountValues.discountDescription,
      discountStartIn: discountValues.discountStartIn || null,
      discountEndsIn: discountValues.discountEndsIn || null,
    };

    const updateDiscForm = new FormData();
    updateDiscForm.append("method", "updateDiscounts");
    updateDiscForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, updateDiscForm);
      if (conn.data === 1) {
        toast("Successfully Updated!");
        resetModal();
        loadDiscounts(); // Reload data
      } else {
        toast("Failed to update...");
      }
    } catch (err) {
      toast("Cannot connect to API...");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiscount = async () => {
    if (!selectedDiscount) return;
    
    setIsLoading(true);
    const jsonData = {
      discount_id: selectedDiscount.discount_id
    };
    
    const formData = new FormData();
    formData.append("method", "disableDiscounts");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully deleted discount");
        resetModal();
        loadDiscounts();
      } else {
        toast("Failed to delete discount");
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
      toast("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const popDeleteModal = (discount) => {
    setModalMode('delete');
    setSelectedDiscount({
      discount_id: discount.discounts_id,
      discountName: discount.discounts_name
    });
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setModalMode("");
    setSelectedDiscount(null);
    form.reset();
  };

  // Filter discounts based on search term
  const filteredDiscounts = allDiscounts.filter(discount =>
    discount.discounts_name.toLowerCase().includes(searchTerm.toLowerCase())
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
                            {(() => {
                              const discountsWithPercentage = allDiscounts.filter(disc => 
                                disc.discounts_percentage !== null && 
                                disc.discounts_percentage !== undefined && 
                                !isNaN(parseFloat(disc.discounts_percentage))
                              );
                              
                              if (discountsWithPercentage.length === 0) return '0%';
                              
                              const average = discountsWithPercentage.reduce((sum, disc) => 
                                sum + parseFloat(disc.discounts_percentage), 0
                              ) / discountsWithPercentage.length;
                              
                              return `${Math.round(average * 100) / 100}%`;
                            })()}
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
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold text-center">Percentage</TableHead>
                          <TableHead className="font-semibold text-center">Amount</TableHead>
                          <TableHead className="font-semibold text-center">Duration Date</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDiscounts.length > 0 ? (
                          filteredDiscounts.map((discount, index) => {
                            return (
                              <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="font-medium">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                    #{discount.discounts_id}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{discount.discounts_name}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {discount.discounts_description || 'No description'}
                                </TableCell>
                                <TableCell className="text-center">
                                  {discount.discounts_percentage ? (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                      {discount.discounts_percentage}%
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {discount.discounts_amount ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                      ₱{discount.discounts_amount}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {(discount.discount_start_in || discount.discount_ends_in) ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                      {discount.discount_start_in ? DateFormatter.formatLongDate(discount.discount_start_in) : '—'}
                                      {" "}-
                                      {" "}
                                      {discount.discount_ends_in ? DateFormatter.formatLongDate(discount.discount_ends_in) : '—'}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
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
                                          onClick={() => popDeleteModal(discount)}
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
            isVisible={showModal}
            onClose={resetModal}
            modalTitle={
              modalMode === 'add'
                ? 'Add new Discount'
                : modalMode === 'update'
                  ? 'Update Existing Discount'
                  : 'Remove Discount'
            }
          >
            {modalMode === 'add' && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => addNewDiscounts(values))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="discountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Early Bird, Senior Citizen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 15.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount (Fixed)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountStartIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starts In</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder="Start date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountEndsIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ends In</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder="End date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="discountDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optional description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>Submit</Button>
                </form>
              </Form>
            )}

            {modalMode === 'update' && selectedDiscount && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    updateDiscounts(values);
                  })}
                  className="space-y-4"
                >
                  {/* Discount Name */}
                  <FormField
                    control={form.control}
                    name="discountName"
                    defaultValue={selectedDiscount.discountName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Discount Percentage */}
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    defaultValue={selectedDiscount.discountPercentage}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="e.g. 15.50" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
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

                  {/* Discount Amount */}
                  <FormField
                    control={form.control}
                    name="discountAmount"
                    defaultValue={selectedDiscount.discountAmount}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount (Fixed)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="e.g. 500" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
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

                  {/* Starts / Ends In */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountStartIn"
                      defaultValue={selectedDiscount.discountStartIn}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starts In</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder="Start date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountEndsIn"
                      defaultValue={selectedDiscount.discountEndsIn}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ends In</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder="End date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="discountDescription"
                    defaultValue={selectedDiscount.discountDescription}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    Update
                  </Button>
                </form>
              </Form>
            )}

            {modalMode === 'delete' && selectedDiscount && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Discount</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete <strong>"{selectedDiscount.discountName}"</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteDiscount} disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Discount
                  </Button>
                </div>
              </div>
            )}
          </AdminModal>
        </>
      )}
    </>
  );
}

export default DiscountMaster;

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>