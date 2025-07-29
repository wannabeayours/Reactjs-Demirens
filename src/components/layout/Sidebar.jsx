import React, { useState } from 'react'
import { Button } from '../ui/button'
import { MenuSquareIcon, Home, User, BedIcon, BookCheckIcon, Calendar1Icon, User2Icon, StarIcon, LogOutIcon, ChevronDown, File, PillBottleIcon, HistoryIcon, Bed, MinusCircleIcon, PlusSquareIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { ScrollArea } from '../ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Link } from 'react-router-dom'


function Sidebar() {
  const [openBookingList, setOpenBookingList] = useState(false);
  const [openMasters, setOpenMasters] = useState(false);



  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button>
            <MenuSquareIcon className="w-4 h-4 text-black" />
          </Button>

        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>DEMIREN HOTEL AND RESTAURANT</SheetTitle>
            <SheetDescription>Hotel Management System</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-130px)] mt-2 pr-2">
            <div className="mt-2 space-y-5 pb-36">
              {/* Dashboard */}
              <Link to="/admin/dashboard" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>

              {/* Profile */}
              <Link to="/admin/profile" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </Link>

              {/* Rooms List */}
              <Link to="/admin/roomslist" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BedIcon className="w-4 h-4" />
                  Rooms List
                </Button>
              </Link>

              {/* Bookings List */}
              <Collapsible open={openBookingList} onOpenChange={setOpenBookingList}>
                <CollapsibleTrigger className="flex items-center justify-between w-full gap-2">
                  <Button variant="ghost" className="w-full flex items-center gap-2">
                    <File className="w-4 h-4" />
                    Booking
                    <ChevronDown className={`ml-auto transition-transform duration-200 transform ${openBookingList ? "rotate-180" : ""}`} />
                  </Button>

                </CollapsibleTrigger>

                <CollapsibleContent side="bottom"
                  className="z-50 w-full bg-background border rounded-md shadow-md p-1"
                  align="start"
                  sideOffset={4}>

                  <ul ul className="flex flex-col gap-2 mt-2">

                    <li>

                      <Link to="/admin/bookinglist" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <BookCheckIcon className="w-4 h-4" />
                          Booking List
                        </span>
                      </Link>
                    </li>

                    <li>

                      <Link to="/admin/newbook" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <BookCheckIcon className="w-4 h-4" />
                          New Bookings
                        </span>
                      </Link>
                    </li>


                  </ul>

                </CollapsibleContent>
              </Collapsible>




              {/* Calendar */}
              <Link to="/admin/calendar" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Calendar1Icon className="w-4 h-4" />
                  Calendar
                </Button>
              </Link>

              {/* Guest Profile */}
              <Link to="/admin/guestprofile" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Guest Profile
                </Button>
              </Link>

              {/* Payments */}
              <Link to="/admin/payments" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BedIcon className="w-4 h-4" />
                  Payments
                </Button>
              </Link>

              {/* Requested Amenities */}
              <Link to="/admin/requestedamenities" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <PillBottleIcon className="w-4 h-4" />
                  Requested Amenities
                </Button>
              </Link>


              {/* Reviews */}
              <Link to="/admin/reviews" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <StarIcon className="w-4 h-4" />
                  Reviews
                </Button>
              </Link>

              {/* Transaction History */}
              <Link to="/admin/transactionhistory" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  Transaction History
                </Button>
              </Link>

              {/* Visitors Log*/}
              <Link to="/admin/visitorslog" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User2Icon className="w-4 h-4" />
                  Visitors Log
                </Button>
              </Link>

              {/* Master Files */}
              <Collapsible open={openMasters} onOpenChange={setOpenMasters}>
                <CollapsibleTrigger className="flex items-center justify-between w-full gap-2">
                  <Button variant="ghost" className="w-full flex items-center gap-2">
                    <File className="w-4 h-4" />
                    Master Files
                    <ChevronDown className={`ml-auto transition-transform duration-200 transform ${openMasters  ? "rotate-180" : ""}`} />
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent side="bottom"
                  className="z-50 w-full bg-background border rounded-md shadow-md p-1"
                  align="start"
                  sideOffset={4}>

                  <ul className="flex flex-col gap-2 mt-2">

                    <li>
                      <Link to="/admin/amenitymaster" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <PillBottleIcon className="w-4 h-4" />
                          Amenities Masters
                        </span>
                      </Link>
                    </li>


                    <li>
                      <Link to="/admin/chargescategory" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <PlusSquareIcon className="w-4 h-4" />
                          Charges Category
                        </span>
                      </Link>
                    </li>

                    <li>
                      <Link to="/admin/chargemaster" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <MinusCircleIcon className="w-4 h-4" />
                          Charges Masters
                        </span>
                      </Link>
                    </li>


                    <li>
                      <Link to="/admin/discountmaster" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <MinusCircleIcon className="w-4 h-4" />
                          Discount Masters
                        </span>
                      </Link>
                    </li>


                    <li>
                      <Link to="/admin/roomtypemaster" className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded block w-full">
                        <span className="flex items-center gap-2">
                          <Bed className="w-4 h-4" />
                          Room Type Masters
                        </span>
                      </Link>
                    </li>
                  </ul>

                </CollapsibleContent>
              </Collapsible>

            </div>
          </ScrollArea>
          <div className="absolute bottom-4 left-4 right-4 border-t pt-4 bg-background">
            <Button variant="outline" >
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