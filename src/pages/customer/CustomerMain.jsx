import React, { useState } from 'react'
import CustomerDashboard from './CustomerDashboard'
import CustomerProfile from './CustomerProfile'
import CustomerHeader from '@/components/layout/CustomerHeader';
import CustomerBookingHis from './CustomerBookingHis';
import CustomerReqAmenities from './CustomerReqAmenities';
import CustomerInvoices from './CustomerInvoices';
import CustomerSettings from './CustomerSettings';
import CustomerBookingSummary from './CustomerBookingSummary';
import CustomerViewBookings from './CustomerViewBookings';
import CustomerFeedback from './CustomerFeedback';

function CustomerMain() {
    const [viewIndex, setViewIndex] = useState(localStorage.getItem("viewIndex") || 0);
    const customerpages = [
        <CustomerDashboard/>,
        <CustomerProfile/>,
        <CustomerBookingSummary/>,
        <CustomerBookingHis/>,
        <CustomerReqAmenities/>,
        <CustomerViewBookings/>,
        <CustomerInvoices/>,
        <CustomerFeedback/>,
        <CustomerSettings/>,
        
    ]
    const handleViewChange = (index) => {
        localStorage.setItem("viewIndex", index);
        setViewIndex(index);
      };

      
  return (
    <div>
        <CustomerHeader handleViewChange={handleViewChange} />
        {customerpages[viewIndex]}
    </div>
  )
}

export default CustomerMain