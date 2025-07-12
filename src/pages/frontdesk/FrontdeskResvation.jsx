import React, { useEffect } from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import FrontdeskModal from '@/components/modals/FrontdeskModal';
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

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// -- ShadCN Form -- For Searches
const searchSchema = z.object({

})

function FrontdeskReservation() {
    const APIConn = `${localStorage.url}front-desk.php`;

    const [resvData, setResvData] = useState([]);
    const [selData, setSelData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState(0)

    const bookingStatuses = {
        1: "Approved",
        2: "Pending",
        3: "Cancelled"
    };

    // Modal
    const [modalSettings, setModalSettings] = useState({
        modalMode: '',
        showModal: false
    });

    const editStatus = (reserveData) => {
        setModalSettings({
            modalMode: 'editResv',
            showModal: true
        })
        console.log('Data: ', reserveData);
        setSelData(reserveData);
        setPermission(reserveData.booking_status_id);
    }

    //   API Connection
    const getBookings = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('method', 'view-reservations');

        try {
            const conn = await axios.post(APIConn, formData);
            if (conn.data) {
                console.log(conn.data)
                setResvData(conn.data !== 0 ? conn.data : 0)
            } else {
                toast('Failed to connect');
            }

        } catch (err) {
            toast('Something went wrong');
            console.log(err)
        } finally {
            resetUseState();
            toast('Done Loading');
        }
    }

    const insertBookingStatus = async () => {
        const dataSummary = {
            booking_id: selData.booking_id,
            booking_status_id: permission
        }

        const formData = new FormData();
        formData.append("method", "record-booking-status");
        formData.append("json", JSON.stringify(dataSummary));
        console.log(formData)

        try {
            const response = await axios.post(APIConn, formData);

            if (response.data.success) {
                toast("Booking status updated successfully");
                // Optionally refetch data:
                getBookings();
                resetUseState();
            } else {
                toast("Failed to update status");
                console.log(response.data);
                resetUseState();
            }
        } catch (err) {
            toast("Error updating status");
            console.error(err);
            resetUseState();
        }
    };


    // Other Functions
    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        const [date, time] = dateTime.split(' ');
        const newDate = new Date(date);

        return newDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const resetUseState = () => {
        setIsLoading(false);
        setModalSettings({ modalMode: "", showModal: false });
    }

    useEffect(() => {
        getBookings()
    }, [])

    return (
        <>
            {
                isLoading ?
                    <>Still Loading</> :
                    <div>
                        <FrontHeader />
                        <div>
                            <div>FrontDesk Reservations Page</div>

                            <div className="w-full  p-4 rounded-md border">
                                <div className='p-2'>
                                    Search Card for Reservation Here
                                </div>

                                <Table>
                                    <ScrollArea className="h-[400px] w-full p-4">
                                        <TableCaption>A list of your recent invoices.</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <Table></Table>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>

                                            {
                                                resvData.map((reservations, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{reservations.booking_id}</TableCell>
                                                        <TableCell>{reservations.customers_walk_in_id === null ? 'Yes' : 'No'}</TableCell>
                                                        <TableCell>
                                                            {reservations.customers_walk_in_id !== null ? reservations.fullname : reservations.customers_online_username}
                                                        </TableCell>
                                                        <TableCell>{reservations.booking_status_name === null ? "Pending" : reservations.booking_status_name}</TableCell>
                                                        <TableCell>₱{reservations.booking_downpayment}</TableCell>
                                                        <TableCell>{formatDateTime(reservations.booking_checkin_dateandtime)}</TableCell>
                                                        <TableCell>{formatDateTime(reservations.booking_checkout_dateandtime)}</TableCell>
                                                        <TableCell>{reservations.ref_num}</TableCell>
                                                        <TableCell>
                                                            <Button className='h-8 px-3 text-sm' onClick={() => editStatus(reservations)}>
                                                                <Ellipsis />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }

                                        </TableBody>
                                    </ScrollArea>
                                </Table>
                            </div>

                        </div>
                    </div>
            }
            <FrontdeskModal
                isVisible={modalSettings.showModal}
                onClose={() => setModalSettings({
                    showModal: false,
                    modalMode: ''
                })}
                modalTitle={modalSettings.modalMode === 'editResv' ? 'Editing...' : null}
            >

                {
                    selData && (
                        <>
                            <div className="grid grid-cols-2 gap-6 text-base p-4">
                                {/* Column 1 */}
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Name</p>
                                        <p className="text-lg font-semibold text-white">
                                            {selData.username !== null ? selData.username : selData.walk_in}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Downpayment</p>
                                        <p className="text-lg text-white">₱{selData.booking_downpayment}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Check-In</p>
                                        <p className="text-lg text-white">{formatDateTime(selData.check_in)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Check-Out</p>
                                        <p className="text-lg text-white">{formatDateTime(selData.check_out)}</p>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Date Updated At:</p>
                                        <p className="text-lg text-white">{(formatDateTime(selData.updated_at))}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Reference Number</p>
                                        <p className="text-lg text-white">{selData.ref_num}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Booking Status</p>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    {bookingStatuses[permission] || "Select status"}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuRadioGroup
                                                    value={String(permission)}
                                                    onValueChange={(val) => setPermission(Number(val))}
                                                >
                                                    <DropdownMenuRadioItem value="1">Approved</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="2">Pending</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="3">Cancelled</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Room Numbers</p>
                                        <p className="text-lg text-white">{selData.roomnumber_ids}</p>
                                    </div>

                                    <div>
                                        <Button onClick={() => insertBookingStatus()}>Change Permission</Button>
                                    </div>
                                </div>
                            </div>

                        </>
                    )
                }

            </FrontdeskModal>
        </>
    )
}

export default FrontdeskReservation;