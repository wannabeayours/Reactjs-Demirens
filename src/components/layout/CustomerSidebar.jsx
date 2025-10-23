import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Archive, Book, History, Home, LogOutIcon, MenuSquareIcon, Shield, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerSidebar = ({ handleViewChange, activeIndex }) => {
  const [open, setOpen] = useState(false);
  const navigateTo = useNavigate();

  const SidebarLink = ({ icon, label, index }) => {
    const isActive = activeIndex === index;
    return (
      <Button
        variant="ghost"
        className={`w-full justify-start gap-3 p-4 transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-white to-white/90 text-blue-900 font-semibold rounded-lg shadow-md transform scale-105' 
            : 'hover:bg-[#58A0C8]/30 hover:translate-x-1 text-white/90 hover:text-white'
        }`}
        onClick={() => {
          handleViewChange(index);
          setOpen(false); // close sheet on mobile
        }}
      >
        <div className={`${isActive ? 'text-blue-700' : 'text-white/70'} transition-colors duration-300`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </Button>
    );
  };

  const sidebarList = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Profile', icon: <User className="w-5 h-5" /> },
    { label: 'Booking Summary', icon: <Book className="w-5 h-5" /> },
    { label: 'Booking History', icon: <History className="w-5 h-5" /> },
    // { label: 'Requested Amenities', icon: <Send className="w-5 h-5" /> },
    { label: 'View Booking', icon: <Book className="w-5 h-5" /> },
    // { label: 'Invoice', icon: <ReceiptText className="w-5 h-5" /> },
    { label: 'Password and Security', icon: <Shield className="w-5 h-5" /> },
    { label: 'Archive', icon: <Archive className="w-5 h-5" /> },
    // { label: 'Activity Log', icon: <History className="w-5 h-5" /> },
    { label: 'Feedback', icon: <Star className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    navigateTo("/");
    localStorage.clear();
  }

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-gradient-to-b from-[#113f67] via-[#34699A] to-[#226597] text-white w-72 shadow-xl">
      <div>
        <div className="p-6 border-b border-[#58A0C8]/30 bg-gradient-to-r from-[#113f67] to-[#226597]">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Hotel Demiren</h2>
          <p className="text-sm text-blue-200/80 mt-1">Luxury & Comfort</p>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)] p-3">
          <div className="space-y-2">
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
      <div className="p-4 border-t border-[#58A0C8]/30 bg-[#113f67]/40">
        <Button
          variant="destructive"
          className="w-full justify-start text-white gap-3 p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-lg group"
          onClick={handleLogout}
        >
          <LogOutIcon className="w-5 h-5 mr-2 group-hover:translate-x-[-2px] transition-transform duration-300" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 z-50 animate-fadeIn">
        <SidebarContent />
      </aside>
      <div className="md:hidden p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="bg-gradient-to-r from-[#113f67] to-[#226597] hover:shadow-lg transition-all duration-300 p-3">
              <MenuSquareIcon className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-[#58A0C8]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default CustomerSidebar;
