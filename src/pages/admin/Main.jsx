import React, { useState } from 'react'
import AdminDashboard from './Dashboard'
import AdminProfile from './Profile'
import AdminHeader from './components/AdminHeader'
import AdminRoomsList from './RoomsList'
import AdminCalendar from './Calendar'
import AdminGuestProfile from './GuestProfile'
import AdminPayments from './Payments'
import AdminRequestedAmenities from './Amenity Pages/RequestedAmenities'
import AdminReviews from './Reviews'
import AdminTransactionHis from './TransactionHis'
import AdminVisitorsLog from './Visitor Pages/VisitorsLog'
import AdminBookingList from './BookingList'
import AdminNewBook from './WalkIn_Folder/AddWalkIn'
import AdminAmenityMaster from './Master_Files/AmenityMaster'
import AdminChargesCategory from './Master_Files/ChargesCategory'
import AdminChargeMaster from './Master_Files/ChargeMaster'
import AdminDiscountMaster from './Master_Files/DiscountMaster'
import AdminRoomtype from './Master_Files/RoomTypeMaster'
import EmployeeManagement from './EmployeeList'

export const AdminMain = () => {

  const [viewIndex, setViewIndex] = useState(0)

  const handleViewChange = (index) => {
    console.log("index", index)
    setViewIndex(index)
  }
  const adminViews = [
    <AdminDashboard />,
    <AdminProfile />,
    <EmployeeManagement />,
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
