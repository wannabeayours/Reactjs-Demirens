import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Archive, Book, History, Home, Hotel, House, LogOutIcon, MenuSquareIcon, ReceiptText, Send, Shield, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const CustomerSidebar = ({ handleViewChange, activeIndex }) => {
 const [open, setOpen] = useState(false);

 const changeView = (index) => {
  handleViewChange(index);
  setOpen(false);
 };

 
  const SidebarLink = ({ icon, label, index }) => {
    const isActive = activeIndex === index;
    return (
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 p-9 ${
          isActive ? 'bg-white text-black font-semibold' : 'hover:bg-[#58A0C8]'
        }`}
        onClick={() => handleViewChange(index)}
      >
        {icon}
        {label}
      </Button>
    );
  };

  // ... rest of your code



 const sidebarList = [
  { label: "Dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Profile", icon: <User className="w-4 h-4" /> },
  { label: "Booking Summary", icon: <Book className="w-4 h-4" /> },
  { label: "Booking History", icon: <History className="w-4 h-4" /> },
  { label: "Requested Amenities", icon: <Send className="w-4 h-4" /> },
  { label: "View Booking", icon: <Book className="w-4 h-4" /> },
  { label: "Invoice", icon: <ReceiptText className="w-4 h-4" /> },
  // { label: "Feedback", icon: <Star className="w-4 h-4" /> },
  { label: "Password and Security", icon: <Shield className="w-4 h-4" /> },
  { label: "Archive", icon: <Archive className="w-4 h-4" /> },
 ];

 return (
  <aside className="w-64 bg-[#34699A] text-white fixed top-0 left-0 bottom-0 flex flex-col justify-between z-50 rounded-lg ">
   <div>
    <div className="p-4 border-b border-[#58A0C8]">
     <h2 className="text-lg font-bold flex items-center">
    
      Hotel Demiren and Restaurant
     </h2>
    </div>
    <ScrollArea className="h-[calc(100vh-150px)] p-2">
     <div className="space-y-2">
      {sidebarList.map((link, i) => (
       <SidebarLink
        key={i}
        icon={link.icon}
        label={link.label}
        index={i}
        activeIndex={activeIndex}
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
  </aside>
 );
};


export default CustomerSidebar;

