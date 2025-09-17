import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  MenuSquareIcon, Home, User, BedIcon, File, CreditCard, User2Icon, Calendar1Icon,
  StarIcon, LogOutIcon, PillBottleIcon, HistoryIcon, Bed, MinusCircleIcon,
  PlusSquareIcon, Percent, ChevronDown, Package, NotebookPen, Laptop, ReceiptText, Wallet
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Link } from 'react-router-dom'

function Sidebar({ onCollapse }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [openMasters, setOpenMasters] = useState(false)
  const [openPayments, setOpenPayments] = useState(false)
  const [openBookings, setOpenBookings] = useState(false) // New state for bookings
  const [isOpen, setIsOpen] = useState(false)

  const mainLinks = [
    { path: "/admin/dashboard", icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { path: "/admin/profile", icon: <User className="w-4 h-4" />, label: "Profile" },
    { path: "/admin/roomslist", icon: <BedIcon className="w-4 h-4" />, label: "Rooms List" },
    { path: "/admin/bookinglist", icon: <File className="w-4 h-4" />, label: "Bookings List" },
    { path: "/admin/guestprofile", icon: <User className="w-4 h-4" />, label: "Guest Profiles" },
    { path: "/admin/transactionhistory", icon: <HistoryIcon className="w-4 h-4" />, label: "Transaction History" },
    { path: "/admin/calendar", icon: <Calendar1Icon className="w-4 h-4" />, label: "Calendar" },
    { path: "/admin/visitorslog", icon: <User2Icon className="w-4 h-4" />, label: "Visitors" },
    { path: "/admin/reviews", icon: <StarIcon className="w-4 h-4" />, label: "Reviews" },
  ]

  const bookingLinks = [
  { path: "/admin/choose-rooms", icon: <NotebookPen className="w-4 h-4" />, label: "Add Walk In" },
  { path: "/admin/online", icon: <Laptop className="w-4 h-4" />, label: "Add Online" },
]

const paymentLinks = [
  { path: "/admin/invoice", icon: <ReceiptText className="w-4 h-4" />, label: "Invoice" },
  { path: "/admin/billings", icon: <Wallet className="w-4 h-4" />, label: "Billings" },
]

  const masterLinks = [
    { path: "/admin/roomtypemaster", icon: <Bed className="w-4 h-4" />, label: "Room Types" },
    { path: "/admin/amenitymaster", icon: <PillBottleIcon className="w-4 h-4" />, label: "Amenities" },
    { path: "/admin/requestedamenities", icon: <PillBottleIcon className="w-4 h-4" />, label: "Request Amenities" },
    { path: "/admin/chargemaster", icon: <MinusCircleIcon className="w-4 h-4" />, label: "Charges" },
    { path: "/admin/chargescategory", icon: <PlusSquareIcon className="w-4 h-4" />, label: "Charges Masters" },
    { path: "/admin/discountmaster", icon: <Percent className="w-4 h-4" />, label: "Discount" },
  ]

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (onCollapse) {
      onCollapse(open);
    }
  };

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="shadow-sm">
            <MenuSquareIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>DEMIREN HOTEL AND RESTAURANT</SheetTitle>
            <SheetDescription>Hotel Management System</SheetDescription>
          </SheetHeader>

          <div className="px-2 mt-4">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-180px)] mt-2 pr-2">
            <div className="mt-2 space-y-3 pb-36">

              {/* Main Links */}
              {mainLinks
                .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, index) => (
                  <Link to={item.path} key={index} className="block w-full">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      {item.icon}
                      {item.label}
                    </Button>
                  </Link>
                ))}

              {/* Collapsible: Bookings */}
              <Collapsible open={openBookings} onOpenChange={setOpenBookings}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between items-center">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Bookings
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openBookings ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-2 mt-1">
                  {bookingLinks
                    .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item, index) => (
                      <Link to={item.path} key={index} className="block w-full">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          {item.icon}
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Collapsible: Payments */}
              <Collapsible open={openPayments} onOpenChange={setOpenPayments}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between items-center">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payments
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openPayments ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-2 mt-1">
                  {paymentLinks
                    .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item, index) => (
                      <Link to={item.path} key={index} className="block w-full">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          {item.icon}
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Collapsible: Master Group */}
              <Collapsible open={openMasters} onOpenChange={setOpenMasters}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Masters
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openMasters ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-4 space-y-2 mt-1">
                  {masterLinks
                    .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item, index) => (
                      <Link to={item.path} key={index} className="block w-full">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          {item.icon}
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                </CollapsibleContent>
              </Collapsible>

            </div>
          </ScrollArea>

          <div className="absolute bottom-4 left-4 right-4 border-t pt-4 bg-background">
            <Button variant="outline">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Sidebar
