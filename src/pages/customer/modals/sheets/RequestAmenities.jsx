"use client"
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { BedDouble, Send } from 'lucide-react'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'

function RequestAmenities({ bookingId, bookingRoomId, getBookingSummary, isAddBed }) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [amenities, setAmenities] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [notes, setNotes] = useState("")

  // 🔹 Fetch master amenities
  const getAmenitiesMaster = useCallback(async () => {
    try {
      const url = localStorage.getItem('url') + 'customer.php';
      const formData = new FormData();
      formData.append("operation", "getAmenitiesMaster");
      const res = await axios.post(url, formData);
      console.log("res ni getAmenitiesMaster", res);

      let filteredAmenities = res.data;

      // ✅ Filter "Bed" if isAddBed is 1 or true
      if (String(isAddBed) === "1" || isAddBed === true) {
        filteredAmenities = res.data.filter(a =>
          a.charges_master_name?.trim().toLowerCase() !== "bed"
        );
      }

      setAmenities(Array.isArray(filteredAmenities) ? filteredAmenities : []);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }, [isAddBed]);


  useEffect(() => {
    console.log("isAddBedisAddBedisAddBed", isAddBed);
    getAmenitiesMaster();
  }, [getAmenitiesMaster])

  // 🔹 Handle check/uncheck
  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  // 🔹 Submit from Sheet → open Dialog if valid
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error("Please select at least one amenity");
      return;
    }

    // build selected amenities for the modal
    const selected = amenities.filter(a =>
      selectedItems.includes(a.charges_master_id)
    ).map(a => ({
      id: a.charges_master_id,
      name: a.charges_master_name,
      price: a.charges_master_price,
      quantity: 1,
      total: a.charges_master_price
    }));

    setSelectedAmenities(selected);
    setDialogOpen(true);
  }

  // 🔹 Update quantity & total per amenity
  const handleQuantityChange = (index, quantity) => {
    const updated = [...selectedAmenities];
    if (quantity < 1 || isNaN(quantity)) quantity = 1;
    updated[index].quantity = quantity;
    updated[index].total = updated[index].price * quantity;
    setSelectedAmenities(updated);
  };

  // 🔹 Grand total auto compute
  const grandTotal = useMemo(() => {
    return selectedAmenities.reduce((acc, item) => acc + item.total, 0);
  }, [selectedAmenities]);

  // 🔹 Confirm → build PHP JSON
  const handleConfirm = () => {
    // validation: all quantity > 0
    for (const item of selectedAmenities) {
      if (item.quantity < 1 || isNaN(item.quantity)) {
        toast.error("Please enter valid quantity for all items");
        return;
      }
    }
    console.log("bookingId", bookingId)
    console.log("bookingRoomId", bookingRoomId)
    if (!bookingId || !bookingRoomId) {
      toast.error("Booking information not found");
      return;
    }

    // build payload for PHP
    const payload = {
      bookingId: parseInt(bookingId),
      notes: notes,
      charges: selectedAmenities.map(item => ({
        booking_room_id: parseInt(bookingRoomId),
        charges_master_id: item.id,
        charges_quantity: item.quantity,
        booking_charges_price: item.price * item.quantity
      }))
    };

    // ✅ This is the JSON your PHP expects 
    console.log("Payload for PHP:", JSON.stringify(payload, null, 2));


    const url = localStorage.getItem('url') + 'customer.php';
    const formData = new FormData();
    formData.append("operation", "addBookingCharges");
    formData.append("json", JSON.stringify(payload));
    axios.post(url, formData).then(res => {
      console.log("res ni request amenities", res);
      if (res.data === 1) {
        getBookingSummary();
        toast.success("Amenities added successfully");
      } else {
        toast.error("Failed to add amenities");
      }
    });

    setDialogOpen(false);
    setOpen(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>
            <Send className="mr-2" />
            Request Amenities
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="rounded-2xl ">
          <SheetHeader>
            <SheetTitle>Request Amenities</SheetTitle>
          </SheetHeader>

          <div className="mt-4 px-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-3">
                {amenities.map((item) => (
                  <label key={item.charges_master_id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.charges_master_id)}
                      onChange={() => handleCheckboxChange(item.charges_master_id)}
                    />
                    <span className="text-sm font-normal">
                      <BedDouble className="inline w-4 h-4 mr-1" />
                      {item.charges_master_name}{` (${item.charges_master_price === 0 ? "Free" : "₱" + parseFloat(item.charges_master_price).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })})`}
                    </span>
                  </label>
                ))}
              </div>

              <textarea
                placeholder="Add notes here..."
                className="mt-6 w-full h-24 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0b04e0]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Button type="submit" className="w-full mt-4 font-semibold">
                Next
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* ShadCN modal for selected amenities */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Amenities & Quantities</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAmenities.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span>{item.name} (₱{item.price} each)</span>
                  <span className="text-xs text-gray-500">Total: ₱{item.total}</span>
                </div>
                {item.name.trim().toLowerCase() === "bed" ? (
                  // ✅ Bed: Fixed quantity of 1
                  <Input
                    type="number"
                    min="1"
                    max="1"
                    value={1}
                    disabled
                    className="w-20 cursor-not-allowed bg-gray-100 text-gray-500"
                  />
                ) : (
                  // ✅ Other amenities: editable quantity
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    className="w-20"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Grand total display */}
          <div className="mt-4 font-semibold flex justify-between">
            <span>Grand Total:</span>
            <span>₱{grandTotal}</span>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RequestAmenities
