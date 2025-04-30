import React, { useState } from 'react'
import CustomerDashboard from './CustomerDashboard'
import CustomerProfile from './CustomerProfile'
import CustomerHeader from '@/components/layout/CustomerHeader';
import CustomerBookingHis from './CustomerBookingHis';
import CustomerReqAmenities from './CustomerReqAmenities';
import CustomerInvoices from './CustomerInvoices';

function CustomerMain() {
    const [viewIndex, setViewIndex] = useState(0);
    const customerpages = [
        <CustomerDashboard/>,
        <CustomerProfile/>,
        <CustomerBookingHis/>,
        <CustomerReqAmenities/>,
        <CustomerInvoices/>,
        
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