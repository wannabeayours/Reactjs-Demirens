import React, { useState } from 'react'
import CustomerDashboard from './CustomerDashboard'
import CustomerProfile from './CustomerProfile'
import CustomerHeader from '@/components/layout/CustomerHeader';
import CustomerBookingHis from './CustomerBookingHis';
import CustomerReqAmenities from './CustomerReqAmenities';
import CustomerInvoices from './CustomerInvoices';
import CustomerSettings from './CustomerSettings';

function CustomerMain() {
    const [viewIndex, setViewIndex] = useState(0);
    const customerpages = [
        <CustomerDashboard/>,
        <CustomerProfile/>,
        <CustomerBookingHis/>,
        <CustomerReqAmenities/>,
        <CustomerInvoices/>,
        <CustomerSettings/>,
        
    ]
    const handleViewChange = (index) => {
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