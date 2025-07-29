import React, { useState } from 'react'
import CustomerDashboard from './CustomerDashboard'
import CustomerProfile from './CustomerProfile'
import CustomerBookingHis from './CustomerBookingHis';
import CustomerReqAmenities from './CustomerReqAmenities';
import CustomerInvoices from './CustomerInvoices';
import CustomerSettings from './CustomerSettings';
import CustomerBookingSummary from './CustomerBookingSummary';
import CustomerViewBookings from './CustomerViewBookings';
import CustomerFeedback from './CustomerFeedback';
import CustomerSidebar from '@/components/layout/CustomerSidebar';
import CustomerHeader from '@/components/layout/CustomerHeader';
import CustomerArchieve from './CustomerArchieve';


function CustomerMain() {
  const [viewIndex, setViewIndex] = useState(() => {
    const savedIndex = localStorage.getItem("viewIndex");
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  const customerpages = [
    <CustomerDashboard />,
    <CustomerProfile />,
    <CustomerBookingSummary />,
    <CustomerBookingHis />,
    <CustomerReqAmenities />,
    <CustomerViewBookings />,
    <CustomerInvoices />,
    // <CustomerFeedback />,
    <CustomerSettings />,
    <CustomerArchieve />
    

  ]
  const handleViewChange = (index) => {
    localStorage.setItem("viewIndex", index);
    setViewIndex(index);
  };


  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 z-50">
        <CustomerSidebar handleViewChange={handleViewChange} activeIndex={viewIndex} />
      </div>

      {/* Main content area offset by the sidebar */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Optional: Header (fixed, so adjust padding top if needed) */}
        <div className="fixed top-0 left-64 right-0 z-40">
          <CustomerHeader />
        </div>

        {/* Main content */}
        <main className="pt-16 px-6 pb-6 overflow-y-auto flex-1">
          {customerpages[viewIndex]}
        </main>
      </div>
    </div>
  )
}

export default CustomerMain