import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Book, History, Home, LogOutIcon, MenuSquareIcon, ReceiptText, Send, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const CustomerHeader = ({ handleViewChange }) => {
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
    { label: "Booking Summary", icon: <Book className="w-4 h-4" /> },
    { label: "Booking History", icon: <History className="w-4 h-4" /> },
    { label: "Requested Amenities", icon: <Send className="w-4 h-4" /> },
    { label: "View Booking", icon: <Book className="w-4 h-4" /> },
    { label: "Invoice", icon: <ReceiptText className="w-4 h-4" /> },
    { label: "Password and Security", icon: <Shield className="w-4 h-4" /> },
  ];


  return (
    <div className="flex items-center justify-between grid-cols-2">
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
      <ThemeToggle />
    </div>
  );
};

export default CustomerHeader;
