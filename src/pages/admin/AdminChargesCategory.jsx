import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import AdminModal from '@/pages/admin/components/AdminModal';
import AdminHeader from './components/AdminHeader'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
import { ScrollArea } from '@radix-ui/react-scroll-area';

function AdminChargesCategory() {
  const APIConn = `${localStorage.url}admin.php`;

  const [isLoading, setIsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModeModal] = useState("");
  const [chargeCategories, setChargeCategories] = useState([]);
  const [chargeCategoryID, setChargeCategoryID] = useState(0);
  const [chargeCategoryName, setChargeCategoryName] = useState("");

  // View Charge Categories
  const getChargesCat = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("method", "view_charge_category");

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        console.log('API response:', conn.data);
        setChargeCategories(conn.data !== 0 ? conn.data : []);
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

  const popUpdateModal = (chargeCat) => {
    setModeModal("update");
    setChargeCategoryID(chargeCat.charges_category_id)
    setChargeCategoryName(chargeCat.charges_category_name);
    console.log("Category ID and Category Name: ", chargeCategoryID, chargeCategoryName);
    setShowModal(true)
  };

  const popDeleteModal = (chargeCat) => {
    setModeModal("delete");
    setChargeCategoryID(chargeCat.charges_category_id)
    setChargeCategoryName(chargeCat.charges_category_name);
    console.log("Category ID and Category Name: ", chargeCategoryID, chargeCategoryName);
    setShowModal(true)
  };

  // Adds New Ameneties
  const addChargeCat = async () => {
    setIsLoading(true);
    const jsonData = {
      charge_category_name: chargeCategoryName
    };

    const chargeCatForm = new FormData();
    chargeCatForm.append("method", "add_charge_category");
    chargeCatForm.append("json", JSON.stringify(jsonData));

    try {
      const conn = await axios.post(APIConn, chargeCatForm);
      if (conn.data === 1) {
        toast("Successfully added new Amenity");
      } else {
        toast("No data has been fetched...");
      }

    } catch (err) {
      console.log('Cannot Find API...', err);
    } finally {
      console.log('Content is Done...');
      setIsLoading(false);
      resetUseStates();
    }

  }

  // Update Chosen Amenity
  const updateChargeCat = async () => {
    setIsLoading(true);
    const jsonData = {
      charge_category_id: chargeCategoryID,
      charge_category_name: chargeCategoryName
    }
    const updateChargeCatForm = new FormData();
    updateChargeCatForm.append("method", "update_charge_category");
    updateChargeCatForm.append("json", JSON.stringify(jsonData));

    console.log("Json Data: ", jsonData)

    try {
      const conn = await axios.post(APIConn, updateChargeCatForm);
      if (conn.data === 1) {
        toast("Successfully Updated Category");
        console.log("Success:", conn.data);
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
      charge_category_id: chargeCategoryID,
      charge_category_name: chargeCategoryName
    }
    console.log("Deleted Amenity", jsonData);
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
    setChargeCategoryID(0);
    setChargeCategoryName("");
    setShowModal(false);
    setModeModal("");
  }

  useEffect(() => {
    getChargesCat();
    console.log("Loaded Data: ", chargeCategories)
  }, [showModal === false])

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
              <div className="flex bg-blue justify-end col-start-4">
                <button className="flex p-2 items-left bg-[#05153d] rounded-lg hover:bg-[#1a2e47]"
                  onClick={() => popAddModal()}>
                  <FilePlus2 />Add Charge Category
                </button>
            </div>

            <ScrollArea className="border-4 rounded-md border-sky-500 h-[500px]">
              <Table className="">
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead >Charge ID</TableHead>
                    <TableHead>Charge Category Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chargeCategories.map((chargeCat, index) => (
                    <TableRow key={index}>
                      <TableCell>{chargeCat.charges_category_id}</TableCell>
                      <TableCell>{chargeCat.charges_category_name}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Actions</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2 space-y-2">
                            <Button variant="secondary" className="w-full" onClick={() => popUpdateModal(chargeCat)}>Update</Button>
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

          {/* Admin Modal */}
          <AdminModal isVisible={showModal}
            onClose={() => {
              setShowModal(false); setModeModal("");
            }}
            modalTitle={
              modalMode === "add" ? "Add Charge Category" :
                modalMode === "update" ? "Update Charge Category" :
                  "Delete Charge Category"
            }>
            {modalMode === "add" && (

              <div>
                <label className="block mb-2">Charge Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-black rounded"
                  value={chargeCategoryName}
                  onChange={(e) => setChargeCategoryName(e.target.value)}
                />
                <button
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                  onClick={addChargeCat}
                >
                  Add
                </button>
              </div>
            )}

            {modalMode === "update" && (
              <div>
                <label className="block mb-2">Charge Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-black rounded"
                  value={chargeCategoryName}
                  onChange={(e) => setChargeCategoryName(e.target.value)}
                />
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={updateChargeCat}
                >
                  Save
                </button>
              </div>
            )}

            {modalMode === "delete" && (
              <div>
                <p className="w-full px-4 py-2 text-white rounded">
                  Are you sure you want to delete "{chargeCategoryName}"?
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

export default AdminChargesCategory