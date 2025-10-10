import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export const SelectedBooking = ({ selectedData }) => {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState({})

    useEffect(() => {
        if (open) {
            setData(selectedData)
        }
    }, [open, selectedData])

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger>
                    <Eye
                        onClick={() => setOpen(true)}
                        className="cursor-pointer hover:text-[#34699A]"
                    />
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Your Selected Booking</DialogTitle>
                        <DialogDescription>View your selected booking details</DialogDescription>
                    </DialogHeader>

                    {/* Booking Info */}
                    <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Status:</span>  <Badge
                            className={
                                data?.booking_status === "Approved"
                                    ? "bg-green-500"
                                    : data?.booking_status === "Cancelled"
                                        ? "bg-gray-500"
                                        : data?.booking_status === "Checked-In"
                                            ? "bg-green-500"
                                            : data?.booking_status === "Checked-Out"
                                                ? "bg-secondary text-black"
                                                : "bg-orange-500"
                            }
                        >
                            {data?.booking_status}
                        </Badge></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <p><span className="font-semibold">Check-in:</span> {data?.booking_checkin_dateandtime}</p>
                            <p><span className="font-semibold">Check-out:</span> {data?.booking_checkout_dateandtime}</p>
                            <p><span className="font-semibold">Guests:</span> {data?.guests_amnt}</p>
                            <p><span className="font-semibold">Total:</span> ₱{data?.booking_total}</p>
                            <p><span className="font-semibold">Downpayment:</span> ₱{data?.booking_downpayment}</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 text-[#113F67]">Rooms:</h3>
                    <ScrollArea className="h-48 rounded-md border p-2">
                        <div className="grid gap-2">
                            {data?.rooms?.length > 0 ? (
                                data.rooms.map((room, index) => (
                                    <Card key={room.booking_room_id || index} className="shadow-sm">
                                        <CardContent className="px-3">
                                            <p className="font-medium">{room.roomtype_name} (Room #{room.room_number})</p>
                                            <p className="text-sm text-muted-foreground">₱{room.room_price}</p>
                                            <p className="text-xs mt-1">{room.room_description}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No rooms found</p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
