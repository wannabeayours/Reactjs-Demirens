import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import AdminRoomsList from './pages/admin/AdminRoomsList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdminBookingList from './pages/admin/AdminBookingList';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminGuestProfile from './pages/admin/AdminGuestProfile';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRequestedAmenities from './pages/admin/AdminRequestedAmenities';
import AdminReviews from './pages/admin/AdminReviews';
import AdminTransactionHis from './pages/admin/AdminTransactionHis';
import AdminVisitorsLog from './pages/admin/AdminVisitorsLog';
import AdminAmenityMaster from './pages/admin/AdminAmenityMaster';
import AdminChargesCategory from './pages/admin/AdminChargesCategory';
import AdminChargeMaster from './pages/admin/AdminChargeMaster';
import AdminDiscountMaster from './pages/admin/AdminDiscountMaster';
import AdminRoomtype from './pages/admin/AdminRoomtype';
import AdminNewBook from './pages/admin/AdminNewBook';
import Landingpage from './pages/Landingpage';
// import AdminHeader from './components/layout/AdminHeader';
// import CustomerHeader from './components/layout/CustomerHeader';
// import FrontHeader from './components/layout/FrontHeader';
import LandingHeader from './components/layout/LandingHeader';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerAbout from './pages/customer/CustomerAbout';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerRooms from './pages/customer/CustomerRooms';
import CustomerGallery from './pages/customer/CustomerGallery';
import CustomerRestaurant from './pages/customer/CustomerRestaurant';






function App() {
  return (

    <Router>
      {/* <div>
        {localStorage.getItem("role") === "admin" ? <AdminHeader />
          : localStorage.getItem("role") === "front" ? <FrontHeader />
            : localStorage.getItem("role") === "customer" ? <CustomerHeader />
              : <LandingHeader />
        } */}
        <LandingHeader />

        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Landingpage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/roomslist" element={<AdminRoomsList />} />
            <Route path="/admin/bookinglist" element={<AdminBookingList />} />
            <Route path="/admin/newbook" element={<AdminNewBook />} />
            <Route path="/admin/calendar" element={<AdminCalendar />} />
            <Route path="/admin/guestprofile" element={<AdminGuestProfile />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/requestedamenities" element={<AdminRequestedAmenities />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/transactionhistory" element={<AdminTransactionHis />} />
            <Route path="/admin/visitorslog" element={<AdminVisitorsLog />} />
            <Route path="/admin/amenitymaster" element={<AdminAmenityMaster />} />
            <Route path="/admin/chargescategory" element={<AdminChargesCategory />} />
            <Route path="/admin/chargemaster" element={<AdminChargeMaster />} />
            <Route path="/admin/discountmaster" element={<AdminDiscountMaster />} />
            <Route path="/admin/roomtypemaster" element={<AdminRoomtype />} />
            <Route path="/customer/about" element={<CustomerAbout />} />
            <Route path="/customer/bookings" element={<CustomerBooking />} />
            <Route path="/customer/rooms" element={<CustomerRooms />} />
            <Route path="/customer/gallery" element={<CustomerGallery />} />
            <Route path="/customer/restaurant" element={<CustomerRestaurant />} />
            

          </Routes>
        </div>
   
    </Router>
  );
}

export default App;
