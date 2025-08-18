import React, { useEffect } from 'react'
import AdminHeader from '@/pages/admin/components/AdminHeader';
import AdminModal from '@/pages/admin/components/AdminModal';
import { useState } from 'react';
import axios from 'axios';


// ShadCN
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
import { Button } from '@/components/ui/button';
import { Ellipsis } from 'lucide-react';

// -- ShadCN Form
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function AdminBookingList() {
  const APIConn = `${localStorage.url}admin.php`;

  const [bookings, setBookings] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRefNo, setCurrentRefNo] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState({});

  const getBookings = async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'viewBookings');
      const res = await axios.post(APIConn, formData);
      setBookings(res.data !== 0 ? res.data : []);
      console.log("booking", res);
    } catch (err) {
      toast.error('Error loading bookings');
    }
  };

  const fetchVacantRooms = async (refNo) => {
  try {
    const formData = new FormData();
    formData.append('method', 'reqAvailRooms');
    formData.append('json', JSON.stringify({ reference_no: refNo }));
    const res = await axios.post(APIConn, formData);
    console.log(res.data); // should log your grouped array

    setModalData(res.data);
    setSelectedRooms({});
    setCurrentRefNo(refNo);
    setShowModal(true);
  } catch (err) {
    toast.error('Error fetching vacant rooms');
  }
};


  const handleRoomSelect = (roomtypeId, index, roomId) => {
    setSelectedRooms(prev => {
      const updated = { ...prev };
      if (!updated[roomtypeId]) updated[roomtypeId] = [];
      updated[roomtypeId][index] = roomId;
      return updated;
    });
  };

  const approveBooking = async () => {
    const allRooms = Object.values(selectedRooms).flat();
    if (allRooms.some(room => !room)) {
      toast.error('Please assign all rooms.');
      return;
    }

    const formData = new FormData();
    formData.append('method', 'finalizeBookingApproval');
    formData.append('json', JSON.stringify({
      reference_no: currentRefNo,
      assigned_rooms: allRooms
    }));

    const res = await axios.post(APIConn, formData);
    if (res.data === 'success') {
      toast.success('Booking approved!');
      setShowModal(false);
      getBookings();
    } else {
      toast.error('Failed to approve booking');
    }
  };

  useEffect(() => {
    getBookings();
  }, []);


  return (
    <>
      <div>
        <AdminHeader />
      </div>

      <div>
        <h2>Pending Booking Requests</h2>
        {bookings.length === 0 ? (
          <p>No pending bookings.</p>
        ) : (
          <table border="1" cellPadding="8" cellSpacing="0">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Name</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i}>
                  <td>{b['Ref No']}</td>
                  <td>{b['Name']}</td>
                  <td>{b['Check-in']}</td>
                  <td>{b['Check-out']}</td>
                  <td>{b['Room Type']}</td>
                  <td>{b['Status']}</td>
                  <td>
                    <button onClick={() => fetchVacantRooms(b['Ref No'])}>Approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && (
          <AdminModal
            isVisible={showModal}
            onClose={() => setShowModal(false)}
            modalTitle="Assign Rooms"
          >
            {modalData.map((group, idx) => (
              <div key={idx} className="mb-4">
                <strong className="text-gray-900 dark:text-gray-100">
                  {group.roomtype_name} (x{group.room_count})
                </strong>

                {[...Array(Math.max(0, parseInt(group.room_count) || 0))].map((_, i) => (
                  <div key={i} className="mt-2">
                    <select
                      value={selectedRooms[group.roomtype_id]?.[i] || ''}
                      onChange={e => handleRoomSelect(group.roomtype_id, i, e.target.value)}
                      className="
                border rounded p-2 w-full
                bg-white text-black
                dark:bg-neutral-800 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Room</option>
                      {group.vacant_rooms?.length > 0 ? (
                        group.vacant_rooms.map((room, rIdx) => (
                          <option key={rIdx} value={room.roomnumber_id}>
                            Room #{room.roomnumber_id}
                            {room.roomfloor && ` - Floor ${room.roomfloor}`}
                          </option>
                        ))
                      ) : (
                        <option disabled>No available rooms</option>
                      )}
                    </select>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={approveBooking}>Confirm</Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </AdminModal>
        )}


      </div>


    </>
  )
}

export default AdminBookingList