import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AdminModal from '@/pages/admin/components/AdminModal';
import AdminHeader from '../components/AdminHeader'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { FilePlus2, Search, Filter, MoreHorizontal, Edit, Trash2, CreditCard, ListOrdered } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

function ChargesCategory() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [chargeCategories, setChargeCategories] = useState([]);
  const [chargeCategoryID, setChargeCategoryID] = useState(0);
  const [chargeCategoryName, setChargeCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("method", "viewChargesCategory");

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        setChargeCategories(conn.data !== 0 ? conn.data : []);
      }
    } catch (err) {
      console.log('Cannot Find API...', err);
    } finally {
      setIsLoading(false);
    }
  };

  const popAddModal = () => {
    setModalMode("add");
    setChargeCategoryID(0);
    setChargeCategoryName("");
    setShowModal(true);
  };

  const popUpdateModal = (chargeCat) => {
    setModalMode("update");
    setChargeCategoryID(chargeCat.charges_category_id);
    setChargeCategoryName(chargeCat.charges_category_name);
    setShowModal(true);
  };

  const popDeleteModal = (chargeCat) => {
    setModalMode("delete");
    setChargeCategoryID(chargeCat.charges_category_id);
    setChargeCategoryName(chargeCat.charges_category_name);
    setShowModal(true);
  };

  const addChargeCat = async () => {
    if (!chargeCategoryName.trim()) {
      toast("Please enter category name");
      return;
    }

    setIsLoading(true);
    const jsonData = {
      charge_category_name: chargeCategoryName
    };

    const chargeCatForm = new FormData();
    chargeCatForm.append("method", "addChargesCategory");
    chargeCatForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, chargeCatForm);
      if (conn.data === 1) {
        toast("Successfully added new Category");
        resetModal();
        loadCategories(); // Reload data
      } else {
        toast("Failed to add category");
      }
    } catch (err) {
      console.log('Cannot Find API...', err);
      toast("Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  const updateChargeCat = async () => {
    if (!chargeCategoryName.trim()) {
      toast("Please enter category name");
      return;
    }

    setIsLoading(true);
    const jsonData = {
      charges_category_id: chargeCategoryID,
      charge_category_name: chargeCategoryName
    };
    
    const updateChargeCatForm = new FormData();
    updateChargeCatForm.append("method", "updateChargesCategory");
    updateChargeCatForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, updateChargeCatForm);
      if (conn.data === 1) {
        toast("Successfully Updated Category");
        resetModal();
        loadCategories(); // Reload data
      } else {
        toast("Failed to Update");
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
      toast("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCategory = async () => {
    setIsLoading(true);
    const jsonData = {
      charges_category_id: chargeCategoryID,
      charge_category_name: chargeCategoryName
    };
    
    const formData = new FormData();
    formData.append("method", "disableChargesCategory");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully deleted category");
        resetModal();
        loadCategories(); // Reload data
      } else {
        toast("Failed to delete category");
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
      toast("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setChargeCategoryID(0);
    setChargeCategoryName("");
    setShowModal(false);
    setModalMode("");
  };

  // Filter charge categories based on search term
  const filteredChargeCategories = chargeCategories.filter(category =>
    category.charges_category_name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Charge Category Management</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage charge categories for billing
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => popAddModal()}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                  >
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Search and Filter Bar */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Categories</p>
                          <p className="text-2xl font-bold text-purple-600">{chargeCategories.length}</p>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Categories</p>
                          <p className="text-2xl font-bold text-blue-600">{filteredChargeCategories.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <ListOrdered className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtered Results</p>
                          <p className="text-2xl font-bold text-green-600">{filteredChargeCategories.length}</p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Search className="w-5 h-5 text-green-600" />
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
                          <TableHead className="font-semibold">Category Name</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredChargeCategories.length > 0 ? (
                          filteredChargeCategories.map((category, index) => (
                            <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <TableCell className="font-medium">
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                  #{category.charges_category_id}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{category.charges_category_name}</TableCell>
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
                                        onClick={() => popUpdateModal(category)}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => popDeleteModal(category)}
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
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              {searchTerm ? 'No categories found matching your search.' : 'No categories available.'}
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

          {/* Modal */}
          <AdminModal 
            isVisible={showModal}
            onClose={resetModal}
            modalTitle={
              modalMode === "add" ? "Add Charge Category" :
              modalMode === "update" ? "Update Charge Category" :
              "Delete Charge Category"
            }
          >
            {modalMode === "add" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName" className="text-sm font-medium">Charge Category Name</Label>
                  <Input
                    id="categoryName"
                    type="text"
                    placeholder="Enter category name..."
                    value={chargeCategoryName}
                    onChange={(e) => setChargeCategoryName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button onClick={addChargeCat} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
            )}

            {modalMode === "update" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryNameUpdate" className="text-sm font-medium">Charge Category Name</Label>
                  <Input
                    id="categoryNameUpdate"
                    type="text"
                    placeholder="Enter category name..."
                    value={chargeCategoryName}
                    onChange={(e) => setChargeCategoryName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button onClick={updateChargeCat} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Category
                  </Button>
                </div>
              </div>
            )}

            {modalMode === "delete" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Category</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete <strong>"{chargeCategoryName}"</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={removeCategory} disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Category
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

export default ChargesCategory