import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BedIcon, Calendar1Icon, HistoryIcon, Home, LogOutIcon, MenuSquareIcon, PillBottleIcon, StarIcon, User, User2Icon } from 'lucide-react';
import React, { useState } from 'react';



const CustomerSidebar = ({ handleViewChange }) => {
  const [open, setOpen] = useState(false);

  const changeView = (index) => {
    handleViewChange(index);
    setOpen(false);
  };

  const SidebarLink = ({ icon, label, index }) => (
    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { changeView(index) }}>
      {icon}
      {label}
    </Button>
  );

  const sidebarList = [
    { label: "Dashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Profile", icon: <User className="w-4 h-4" /> },
    { label: "Rooms List", icon: <BedIcon className="w-4 h-4" /> },
    { label: "Calendar", icon: <Calendar1Icon className="w-4 h-4" /> },
    { label: "Guest Profile", icon: <User className="w-4 h-4" /> },
    { label: "Payments", icon: <BedIcon className="w-4 h-4" /> },
    { label: "Requested Amenities", icon: <PillBottleIcon className="w-4 h-4" /> },
    { label: "Reviews", icon: <StarIcon className="w-4 h-4" /> },
    { label: "Transaction History", icon: <HistoryIcon className="w-4 h-4" /> },
    { label: "Visitors Log", icon: <User2Icon className="w-4 h-4" /> },
  ];

  // const bookingIndex = sidebarList.length;
  // console.log(bookingIndex);
  // const bookingList = [
  //   { label: "Booking List", icon: <BookCheckIcon className="w-4 h-4" /> },
  //   { label: "New Bookings", icon: <BookCheckIcon className="w-4 h-4" /> },
  // ];

  // const masterIndex = sidebarList.length + bookingList.length;
  // console.log(masterIndex);
  // const masterFilesList = [
  //   { label: "Amenities Masters", icon: <PillBottleIcon className="w-4 h-4" /> },
  //   { label: "Charges Category", icon: <PlusSquareIcon className="w-4 h-4" /> },
  //   { label: "Charges Masters", icon: <MinusCircleIcon className="w-4 h-4" /> },
  //   { label: "Discount Masters", icon: <MinusCircleIcon className="w-4 h-4" /> },
  //   { label: "Room Type Masters", icon: <Bed className="w-4 h-4" /> },
  // ];

  return (
    <div className="flex items-center justify-between">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <MenuSquareIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>DEMIREN HOTEL AND RESTAURANT</SheetTitle>
            <SheetDescription>Hotel Management System</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-130px)] mt-2 pr-2">
            <div className="mt-2 space-y-5 pb-36">
              {sidebarList.map((link, i) => (
                <SidebarLink
                  key={i}
                  icon={link.icon}
                  label={link.label}
                  index={i}
                />
              ))}

              {/* Booking Section */}
              {/* <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full gap-2">
                  <Button variant="ghost" className="w-full flex items-center gap-2">
                    <File className="w-4 h-4" />
                    Booking
                    <ChevronDown className="ml-auto transition-transform duration-200" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2">
                  {bookingList.map((link, i) => (
                    <SidebarLink
                      key={i}
                      icon={link.icon}
                      label={link.label}
                      index={bookingIndex + i}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible> */}

              {/* Master Files Section */}
              {/* <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full gap-2">
                  <Button variant="ghost" className="w-full flex items-center gap-2">
                    <File className="w-4 h-4" />
                    Master Files
                    <ChevronDown className="ml-auto transition-transform duration-200" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2">
                  {masterFilesList.map((link, i) => (
                    <SidebarLink
                      key={i}
                      icon={link.icon}
                      label={link.label}
                      index={masterIndex + i}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible> */}

              <SheetFooter>
                <div className="absolute bottom-4 left-4 right-4 border-t pt-4 bg-background">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <h1 className="text-lg font-semibold text-end px-8   flex-grow">
        Demiren Hotel and Restaurant
      </h1>

    </div>
  );
};

export default CustomerSidebar;
