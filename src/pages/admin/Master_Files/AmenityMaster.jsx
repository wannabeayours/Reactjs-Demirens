import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AdminModal from '@/pages/admin/components/AdminModal'
import AdminHeader from '@/pages/admin/components/AdminHeader';
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { ArrowDownUp, FilePlus2, ListOrdered, Pencil, Trash, Search, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

function AmenityMaster() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [amenityID, setAmenityID] = useState(0);
  const [amenityName, setAmenityName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load amenities on component mount
  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("method", "viewAmenities");

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        setAmenities(conn.data !== 0 ? conn.data : []);
      }
    } catch (err) {
      console.log('Cannot Find API...', err);
    } finally {
      setIsLoading(false);
    }
  };

  const popAddModal = () => {
    setModalMode("add");
    setAmenityID(0);
    setAmenityName("");
    setShowModal(true);
  };

  const popUpdateModal = (amenity) => {
    setModalMode("update");
    setAmenityID(amenity.room_amenities_master_id);
    setAmenityName(amenity.room_amenities_master_name);
    setShowModal(true);
  };

  const popDeleteModal = (amenity) => {
    setModalMode("delete");
    setAmenityID(amenity.room_amenities_master_id);
    setAmenityName(amenity.room_amenities_master_name);
    setShowModal(true);
  };

  const addAmenity = async () => {
    if (!amenityName.trim()) {
      toast("Please enter amenity name");
      return;
    }

    setIsLoading(true);
    const jsonData = { amenity_name: amenityName };
    const formData = new FormData();
    formData.append("method", "addAmenities");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully added new Amenity");
        resetModal();
        loadAmenities(); // Reload data
      } else {
        toast("Failed to add amenity");
      }
    } catch (err) {
      console.log('Cannot Find API...', err);
      toast("Failed to add amenity");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAmenity = async () => {
    if (!amenityName.trim()) {
      toast("Please enter amenity name");
      return;
    }

    setIsLoading(true);
    const jsonData = {
      amenity_id: amenityID,
      amenity_name: amenityName
    };
    const updateAmenityForm = new FormData();
    updateAmenityForm.append("method", "updateAmenities");
    updateAmenityForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, updateAmenityForm);
      if (conn.data === 1) {
        toast("Successfully Updated Item");
        resetModal();
        loadAmenities(); // Reload data
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

  const removeAmenity = async () => {
    setIsLoading(true);
    const jsonData = {
      amenity_id: amenityID,
      amenity_name: amenityName
    };
    
    const formData = new FormData();
    formData.append("method", "disableAmenities");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully deleted amenity");
        resetModal();
        loadAmenities(); // Reload data
      } else {
        toast("Failed to delete amenity");
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
      toast("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setAmenityID(0);
    setAmenityName("");
    setShowModal(false);
    setModalMode("");
  };

  // Filter amenities based on search term
  const filteredAmenities = amenities.filter(amenity =>
    amenity.room_amenities_master_name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Amenity Management</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage hotel amenities and services
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => popAddModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Search and Filter Bar */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search amenities..."
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amenities</p>
                          <p className="text-2xl font-bold text-green-600">{amenities.length}</p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <FilePlus2 className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Amenities</p>
                          <p className="text-2xl font-bold text-blue-600">{filteredAmenities.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <ListOrdered className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtered Results</p>
                          <p className="text-2xl font-bold text-purple-600">{filteredAmenities.length}</p>
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
                          <TableHead className="font-semibold">Amenity Name</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="font-semibold text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAmenities.length > 0 ? (
                          filteredAmenities.map((amenity, index) => (
                            <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <TableCell className="font-medium">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  #{amenity.room_amenities_master_id}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{amenity.room_amenities_master_name}</TableCell>
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
                                        onClick={() => popUpdateModal(amenity)}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => popDeleteModal(amenity)}
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
                              {searchTerm ? 'No amenities found matching your search.' : 'No amenities available.'}
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
              modalMode === "add" ? "Add Amenity" :
              modalMode === "update" ? "Update Amenity" :
              "Delete Amenity"
            }
          >
            {modalMode === "add" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amenityName" className="text-sm font-medium">Amenity Name</Label>
                  <Input
                    id="amenityName"
                    type="text"
                    placeholder="Enter amenity name..."
                    value={amenityName}
                    onChange={(e) => setAmenityName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button onClick={addAmenity} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>
              </div>
            )}

            {modalMode === "update" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amenityNameUpdate" className="text-sm font-medium">Amenity Name</Label>
                  <Input
                    id="amenityNameUpdate"
                    type="text"
                    placeholder="Enter amenity name..."
                    value={amenityName}
                    onChange={(e) => setAmenityName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button onClick={updateAmenity} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Amenity
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Amenity</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete <strong>"{amenityName}"</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetModal}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={removeAmenity} disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Amenity
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

export default AmenityMaster