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
import AdminHeader from './components/layout/AdminHeader';
import CustomerHeader from './components/layout/CustomerHeader';
import FrontHeader from './components/layout/FrontHeader';
import LandingHeader from './components/layout/LandingHeader';






function App() {
  return (

    <Router>
    <div>
      {localStorage.getItem("role") === "admin" ? <AdminHeader />
       : localStorage.getItem("role") === "front" ? <FrontHeader /> 
       : localStorage.getItem("role") === "customer" ? <CustomerHeader /> 
       : <LandingHeader />
      }

        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
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
            
          </Routes>
        </div>
      </div>
  </Router>
  );
}

export default App;
