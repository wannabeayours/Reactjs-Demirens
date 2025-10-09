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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminHeader from '../components/AdminHeader'
import { Search, Filter, MoreHorizontal, Edit, Trash2, DollarSign as DollarSignIcon, CreditCard, TrendingUp, Package } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

function ChargeMaster() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [allCharges, setAllCharges] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");

  const formSchema = z.object({
    chargeName: z.string().min(1, 'Required'),
    chargeCategory: z.string().min(1, 'Required'),
    chargePrice: z.string().min(1, 'Required'),
    chargeDescription: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargeName: '',
      chargeCategory: '',
      chargePrice: '',
      chargeDescription: '',
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadCharges();
    loadCategories();
  }, []);

  const loadCharges = async () => {
    setIsLoading(true);
    const reqFormCharges = new FormData();
    reqFormCharges.append('method', 'viewCharges');

    try {
      const conn = await axios.post(APIConn, reqFormCharges);
      if (conn.data) {
        setAllCharges(conn.data !== 0 ? conn.data : []);
      }
    } catch (err) {
      toast('Failed to load charges');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    const reqFormCategories = new FormData();
    reqFormCategories.append('method', 'viewChargesCategory');

    try {
      const conn = await axios.post(APIConn, reqFormCategories);
      if (conn.data) {
        setAllCategories(conn.data !== 0 ? conn.data : []);
      }
    } catch (err) {
      console.log('Failed to fetch categories...');
    }
  };

  const popAddModal = () => {
    setModalMode('add');
    setSelectedCharge(null);
    form.reset();
    setShowModal(true);
  };

  const popUpdateModal = (chargeData) => {
    const formattedData = {
      chargeName: chargeData.charges_master_name,
      chargeCategory: chargeData.charges_category_id?.toString(),
      chargePrice: chargeData.charges_master_price?.toString(),
      chargeDescription: chargeData.charges_master_description || ''
    };
    
    setSelectedCharge({
      charge_id: chargeData.charges_master_id,
      ...formattedData
    });

    form.reset(formattedData);
    setModalMode("update");
    setShowModal(true);
  };

  const addNewCharge = async (chargeData) => {
    setIsLoading(true);
    const jsonData = {
      charge_category: parseInt(chargeData.chargeCategory),
      charge_name: chargeData.chargeName,
      charge_price: parseFloat(chargeData.chargePrice),
      charge_description: chargeData.chargeDescription || ''
    };
    const addChargeForm = new FormData();
    addChargeForm.append("method", "addCharges");
    addChargeForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, addChargeForm);
      if (conn.data === 1) {
        toast("Added New Charge!");
        resetModal();
        loadCharges(); // Reload data
      } else {
        toast("Failed to add charge");
      }
    } catch (err) {
      toast("Failed to Add Charge...");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharge = async (chargeValues) => {
    setIsLoading(true);
    const jsonData = {
      charges_master_id: selectedCharge.charge_id,
      charge_name: chargeValues.chargeName,
      charge_category: parseInt(chargeValues.chargeCategory),
      charge_price: parseFloat(chargeValues.chargePrice),
      charge_description: chargeValues.chargeDescription || ''
    };

    const updateChargeForm = new FormData();
    updateChargeForm.append("method", "updateCharges");
    updateChargeForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, updateChargeForm);
      if (conn.data === 1) {
        toast("Successfully Updated!");
        resetModal();
        loadCharges(); // Reload data
      } else {
        toast("Failed to update...");
      }
    } catch (err) {
      toast("Cannot connect to API...");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCharge = async () => {
    if (!selectedCharge) return;
    
    setIsLoading(true);
    const jsonData = {
      charges_master_id: selectedCharge.charge_id
    };
    
    const formData = new FormData();
    formData.append("method", "disableCharges");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully deleted charge");
        resetModal();
        loadCharges();
      } else {
        toast("Failed to delete charge");
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
      toast("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const popDeleteModal = (charge) => {
    setModalMode('delete');
    setSelectedCharge({
      charge_id: charge.charges_master_id,
      charge_name: charge.charges_master_name
    });
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setModalMode("");
    setSelectedCharge(null);
    form.reset();
  };

  // Filter charges based on search term
  const filteredCharges = allCharges.filter(charge =>
    charge.charges_master_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charge.charges_category_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Charge Management</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage hotel charges and billing
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => popAddModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Add Charge
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Search and Filter Bar */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search charges..."
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
                  <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Charges</p>
                          <p className="text-2xl font-bold text-emerald-600">{allCharges.length}</p>
                        </div>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Categories</p>
                          <p className="text-2xl font-bold text-blue-600">{allCategories.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Price</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ₱{allCharges.length > 0 
                              ? Math.round(allCharges.reduce((sum, charge) => sum + charge.charges_master_price, 0) / allCharges.length)
                              : 0}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtered Results</p>
                          <p className="text-2xl font-bold text-orange-600">{filteredCharges.length}</p>
                        </div>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                          <Search className="w-5 h-5 text-orange-600" />
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
                          <TableHead className="font-semibold">Category</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold text-center">Price</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCharges.length > 0 ? (
                          filteredCharges.map((charge, index) => {
                            const isActive = charge.charges_master_status_id === 1;
                            return (
                              <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="font-medium">
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    #{charge.charges_master_id}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{charge.charges_master_name}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    {charge.charges_category_name || 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {charge.charges_master_description || 'No description'}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    ₱{charge.charges_master_price}
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
                                          onClick={() => popUpdateModal(charge)}
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => popDeleteModal(charge)}
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
                              {searchTerm ? 'No charges found matching your search.' : 'No charges available.'}
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
                ? 'Add new Charge'
                : modalMode === 'update'
                  ? 'Update Existing Charge'
                  : 'Remove Charge'
            }
          >
            {modalMode === 'add' && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => addNewCharge(values))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="chargeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charge Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Room Service, Laundry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargeCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allCategories.map((category) => (
                              <SelectItem key={category.charges_category_id} value={category.charges_category_id.toString()}>
                                {category.charges_category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="e.g. 100" 
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

                  <FormField
                    control={form.control}
                    name="chargeDescription"
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

            {modalMode === 'update' && selectedCharge && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    updateCharge(values);
                  })}
                  className="space-y-4"
                >
                  {/* Charge Name */}
                  <FormField
                    control={form.control}
                    name="chargeName"
                    defaultValue={selectedCharge.chargeName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charge Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="chargeCategory"
                    defaultValue={selectedCharge.chargeCategory}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allCategories.map((category) => (
                              <SelectItem key={category.charges_category_id} value={category.charges_category_id.toString()}>
                                {category.charges_category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="chargePrice"
                    defaultValue={selectedCharge.chargePrice}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
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
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="chargeDescription"
                    defaultValue={selectedCharge.chargeDescription}
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

            {modalMode === 'delete' && selectedCharge && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Charge</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete <strong>"{selectedCharge.charge_name}"</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteCharge} disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Charge
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

export default ChargeMaster;

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>