import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import AdminModal from '@/pages/admin/components/AdminModal'
import AdminHeader from '@/pages/admin/components/AdminHeader';
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { ArrowDownUp, FilePlus2, ListOrdered, Pencil, Trash } from 'lucide-react';

function AdminAmenityMaster() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);

  // Please use this to replace the other one
  // const [modalSettings, setModalSettings] = useState({
  //     showModal: false,
  //     modalMode: ""
  //   });
  const [showModal, setShowModal] = useState("");
  const [modalMode, setModeModal] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [amenityID, setAmenityID] = useState(0);
  const [amenityName, setAmenityName] = useState("");

  // View Amenities
  const getAmenities = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("method", "view_amenities");

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        console.log(APIConn);
        console.log('API response:', conn.data);
        setAmenities(conn.data !== 0 ? conn.data : []);
      } else {
        console.log("No data has been fetched...");
      }

    } catch (err) {
      console.log('Cannot Find API...', err)
    } finally {
      console.log('Content is Done...');
      setIsLoading(false);
    }

  }

  const popAddModal = () => {
    setModeModal("add");
    setShowModal(true);
  }

  const popUpdateModal = (amenity) => {
    setModeModal("update");
    setAmenityID(amenity.room_amenities_master_id)
    setAmenityName(amenity.room_amenities_master_name);
    setShowModal(true)
  };

  const popDeleteModal = (amenity) => {
    setModeModal("delete");
    setAmenityID(amenity.room_amenities_master_id)
    setAmenityName(amenity.room_amenities_master_name);
    setShowModal(true)
  };

  // Adds New Ameneties
  const addAmenity = async () => {
    setIsLoading(true);
    const jsonData = { amenity_name: amenityName };

    const formData = new FormData();
    formData.append("method", "add_amenities");
    formData.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data === 1) {
        toast("Successfully added new Amenity");
        resetUseStates();
      } else {
        toast("No data has been fetched...");
        resetUseStates();
      }

    } catch (err) {
      console.log('Cannot Find API...', err);
      resetUseStates();
    } finally {
      console.log('Content is Done...');
      setIsLoading(false);
    }

  }

  // Update Chosen Amenity
  const updateAmenity = async () => {
    setIsLoading(true);
    const jsonData = {
      amenity_id: amenityID,
      amenity_name: amenityName
    }
    const updateAmenityForm = new FormData();
    updateAmenityForm.append("method", "update_amenities");
    updateAmenityForm.append("json", JSON.stringify(jsonData));

    console.log("Json Data: ", jsonData)

    try {
      const conn = await axios.post(APIConn, updateAmenityForm);
      if (conn.data === 1) {
        toast("Successfully Updated Item");
        resetUseStates();
      } else {
        toast("Failed to Update.")
        resetUseStates();
      }
    } catch (error) {
      console.log("API Connection Failed..." + error);
    } finally {
      setIsLoading(false);
    }
  }

  // Delete Amenity
  const removeAmenity = () => {
    setIsLoading(true);
    const jsonData = {
      amenity_id: amenityID,
      amenity_name: amenityName
    }
    // console.log("Deleted Amenity", jsonData);
    setIsLoading(false);
    setShowModal(false);
    setModeModal("");
  }

  // Lists Order
  // const AscName = "";
  // const DescName = "";
  // const AscNum = "";
  // const Desc = "";

  const resetUseStates = () => {
    setAmenityID(0);
    setAmenityName("");
    setShowModal(false);
    setModeModal("");
  }

  useEffect(() => {
    console.log("Loaded Data: ", amenities)
    getAmenities();
  }, [APIConn, showModal])

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

            <div className="flex bg-blue justify-end col-start-4 m-3">
              <button className="flex p-2 items-left bg-[#05153d] rounded-lg hover:bg-[#1a2e47]"
                onClick={() => popAddModal()}>
                <FilePlus2 />Add Amenity
              </button>
            </div>

            <ScrollArea className="flex grid border-4 rounded-md border-sky-500 h-[500px]">
              <Table className="w-full h-auto border rounded-lg overflow-hidden">
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Amenity ID</TableHead>
                    <TableHead className="w-1/2">Amenity Name</TableHead>
                    <TableHead className="w-1/4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="max-h-[400px] overflow-y-auto">
                  {amenities.map((amenity, index) => (
                    <TableRow key={index} className="h-12">
                      <TableCell>{amenity.room_amenities_master_id}</TableCell>
                      <TableCell>{amenity.room_amenities_master_name}</TableCell>
                      <TableCell className="w-1/4 text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Actions</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2 space-y-2">
                            <Button variant="secondary" className="w-full" onClick={() => popUpdateModal(amenity)}>Update</Button>
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

          {/* For Updates */}
          <AdminModal isVisible={showModal}
            onClose={() => {
              setShowModal(false); setModeModal("");
            }}
            modalTitle={
              modalMode === "add" ? "Add Amenity" :
                modalMode === "update" ? "Update Amenity" :
                  "Delete Amenity"
            }>
            {modalMode === "add" && (

              <div>
                <label className="block mb-2">Amenity Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-black rounded"
                  value={amenityName}
                  onChange={(e) => setAmenityName(e.target.value)}
                />
                <button
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                  onClick={addAmenity}
                >
                  Add
                </button>
              </div>
            )}

            {modalMode === "update" && (
              <div>
                <label className="block mb-2">Amenity Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-black rounded"
                  value={amenityName}
                  onChange={(e) => setAmenityName(e.target.value)}
                />
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={updateAmenity}
                >
                  Save
                </button>
              </div>
            )}

            {modalMode === "delete" && (
              <div>
                <p className="w-full px-4 py-2 text-white rounded">
                  Are you sure you want to delete "{amenityName}"?
                </p>
                <button
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
                  onClick={removeAmenity}
                >
                  Confirm
                </button>
              </div>
            )}
          </AdminModal>
        </>
      }
    </>
  )
}

export default AdminAmenityMaster