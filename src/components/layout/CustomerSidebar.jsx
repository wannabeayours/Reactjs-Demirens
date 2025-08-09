import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Archive,
  Book,
  History,
  Home,
  LogOutIcon,
  MenuSquareIcon,
  ReceiptText,
  Send,
  Shield,
  User
} from 'lucide-react';
import React, { useState } from 'react';

const CustomerSidebar = ({ handleViewChange, activeIndex }) => {
  const [open, setOpen] = useState(false);

  const SidebarLink = ({ icon, label, index }) => {
    const isActive = activeIndex === index;
    return (
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 p-4 ${
          isActive ? 'bg-white text-black font-semibold' : 'hover:bg-[#58A0C8]'
        }`}
        onClick={() => {
          handleViewChange(index);
          setOpen(false); // close sheet on mobile
        }}
      >
        {icon}
        {label}
      </Button>
    );
  };

  const sidebarList = [
    { label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { label: 'Profile', icon: <User className="w-4 h-4" /> },
    { label: 'Booking Summary', icon: <Book className="w-4 h-4" /> },
    { label: 'Booking History', icon: <History className="w-4 h-4" /> },
    { label: 'Requested Amenities', icon: <Send className="w-4 h-4" /> },
    { label: 'View Booking', icon: <Book className="w-4 h-4" /> },
    { label: 'Invoice', icon: <ReceiptText className="w-4 h-4" /> },
    { label: 'Password and Security', icon: <Shield className="w-4 h-4" /> },
    { label: 'Archive', icon: <Archive className="w-4 h-4" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-[#34699A] text-white w-64">
      <div>
        <div className="p-4 border-b border-[#58A0C8]">
          <h2 className="text-lg font-bold">Hotel Demiren and Restaurant</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-150px)] p-2">
          <div className="space-y-6">
            {sidebarList.map((link, i) => (
              <SidebarLink
                key={i}
                icon={link.icon}
                label={link.label}
                index={i}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-[#58A0C8]">
        <Button
          variant="destructive"
          className="w-full justify-start text-white"
          onClick={() => console.log('Logout')}
        >
          <LogOutIcon className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 z-50">
        <SidebarContent />
      </aside>
      <div className="md:hidden p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className={"bg-[#113f67"}>
              <MenuSquareIcon className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default CustomerSidebar;
