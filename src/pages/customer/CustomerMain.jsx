import React, { useState } from 'react';
import CustomerDashboard from './CustomerDashboard';
import CustomerProfile from './CustomerProfile';
import CustomerBookingHis from './CustomerBookingHis';
import CustomerReqAmenities from './CustomerReqAmenities';
import CustomerInvoices from './CustomerInvoices';
import CustomerSettings from './CustomerSettings';
import CustomerBookingSummary from './CustomerBookingSummary';
import CustomerViewBookings from './CustomerViewBookings';
import CustomerArchieve from './CustomerArchieve';

import CustomerSidebar from '@/components/layout/CustomerSidebar';
import CustomerHeader from '@/components/layout/CustomerHeader';

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MenuSquareIcon } from 'lucide-react';

function CustomerMain() {
  const [viewIndex, setViewIndex] = useState(() => {
    const savedIndex = localStorage.getItem('viewIndex');
    return savedIndex ? parseInt(savedIndex) : 0;
  });

  const [open, setOpen] = useState(false); // for mobile menu drawer

  const customerpages = [
    <CustomerDashboard />,
    <CustomerProfile />,
    <CustomerBookingSummary />,
    <CustomerBookingHis />,
    <CustomerReqAmenities />,
    <CustomerViewBookings />,
    <CustomerInvoices />,
    <CustomerSettings />,
    <CustomerArchieve />
  ];

  const handleViewChange = (index) => {
    localStorage.setItem('viewIndex', index);
    setViewIndex(index);
    setOpen(false); // close sidebar on mobile
  };

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-50">
        <CustomerSidebar handleViewChange={handleViewChange} activeIndex={viewIndex} />
      </div>

      {/* Mobile AppBar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#34699a] flex items-center z-50 shadow">
        <CustomerSidebar handleViewChange={handleViewChange} activeIndex={viewIndex} />
        <h1 className="text-white text-lg font-semibold ml-4">Hotel Demiren</h1>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Header */}
        <div className="fixed top-14 md:top-0 left-0 md:left-64 right-0 z-40">
          <CustomerHeader />
        </div>

        {/* Page content */}
        <main className="pt-28 md:pt-16 px-6 pb-6 overflow-y-auto flex-1">
          {customerpages[viewIndex]}
        </main>
      </div>
    </div>
  );
}

export default CustomerMain;
