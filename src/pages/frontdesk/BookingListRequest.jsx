import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function BookingRequestList() {
    const [bookings, setBookings] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRefNo, setCurrentRefNo] = useState(null);
    const [selectedRooms, setSelectedRooms] = useState({});

    const getBookings = async () => {
        try {
            const url = localStorage.getItem('url') + 'transactions.php';
            const formData = new FormData();
            formData.append('operation', 'bookingList');
            const res = await axios.post(url, formData);
            setBookings(res.data !== 0 ? res.data : []);
        } catch (err) {
            toast.error('Error loading bookings');
        }
    };

    const fetchVacantRooms = async (refNo) => {
        try {
            const url = localStorage.getItem('url') + 'transactions.php';
            const formData = new FormData();
            formData.append('operation', 'getVacantRoomsByBooking');
            formData.append('json', JSON.stringify({ reference_no: refNo }));
            const res = await axios.post(url, formData);
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

        const url = localStorage.getItem('url') + 'transactions.php';
        const formData = new FormData();
        formData.append('operation', 'finalizeBookingApproval');
        formData.append('json', JSON.stringify({
            reference_no: currentRefNo,
            assigned_rooms: allRooms
        }));

        const res = await axios.post(url, formData);
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
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%',
                    height: '100%', background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ background: 'white', padding: 20, minWidth: 400 }}>
                        <h3>Assign Rooms</h3>
                        {modalData.map((group, idx) => (
                            <div key={idx}>
                                <strong>{group.roomtype_name} (x{group.room_count})</strong>
                                {[...Array(parseInt(group.room_count))].map((_, i) => (
                                    <div key={i}>
                                        <select
                                            value={selectedRooms[group.roomtype_id]?.[i] || ''}
                                            onChange={e => handleRoomSelect(group.roomtype_id, i, e.target.value)}
                                        >
                                            <option value="">Select Room</option>
                                            {group.vacant_rooms.map((room, rIdx) => (
                                                <option key={rIdx} value={room.roomnumber_id}>
                                                    Room #{room.roomnumber_id} - Floor {room.roomfloor}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button onClick={approveBooking}>Confirm</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingRequestList;
