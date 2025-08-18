import React, { useState } from 'react'
import AdminDashboard from './AdminDashboard'
import AdminProfile from './AdminProfile'
import AdminHeader from './components/AdminHeader'
import AdminRoomsList from './AdminRoomsList'
import AdminCalendar from './AdminCalendar'
import AdminGuestProfile from './AdminGuestProfile'
import AdminPayments from './AdminPayments'
import AdminRequestedAmenities from './AdminRequestedAmenities'
import AdminReviews from './AdminReviews'
import AdminTransactionHis from './AdminTransactionHis'
import AdminVisitorsLog from './AdminVisitorsLog'
import AdminBookingList from './AdminBookingList'
import AdminNewBook from './WalkIn_Folder/AddWalkIn'
import AdminAmenityMaster from './AdminAmenityMaster'
import AdminChargesCategory from './AdminChargesCategory'
import AdminChargeMaster from './AdminChargeMaster'
import AdminDiscountMaster from './AdminDiscountMaster'
import AdminRoomtype from './AdminRoomtype'

export const AdminMain = () => {

  const [viewIndex, setViewIndex] = useState(0)

  const handleViewChange = (index) => {
    console.log("index", index)
    setViewIndex(index)
  }
  const adminViews = [
    <AdminDashboard />,
    <AdminProfile />,
    <AdminRoomsList />,
    <AdminCalendar />,
    <AdminGuestProfile />,
    <AdminPayments />,
    <AdminRequestedAmenities />,
    <AdminReviews />,
    <AdminTransactionHis />,
    <AdminVisitorsLog />,

    // bookings
    <AdminBookingList />,
    <AdminNewBook />,

    // masterfiles
    <AdminAmenityMaster />,
    <AdminChargesCategory />,
    <AdminChargeMaster />,
    <AdminDiscountMaster />,
    <AdminRoomtype />,
  ]
  return (
    <div>
      <header>
        <AdminHeader handleViewChange={handleViewChange} />
      </header>
      <main>
        {adminViews[viewIndex]}
      </main>
    </div>
  )
}
