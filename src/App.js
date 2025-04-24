import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
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






function App() {
  return (

    <Router>
    <div>
      <Header />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/admin/admindashboard" element={<AdminDashboard />} />
            <Route path="/admin/adminprofile" element={<AdminProfile />} />
            <Route path="/admin/adminroomslist" element={<AdminRoomsList />} />
            <Route path="/admin/adminbookinglist" element={<AdminBookingList />} />
            <Route path="/admin/adminnewbook" element={<AdminNewBook />} />
            <Route path="/admin/admincalendar" element={<AdminCalendar />} />
            <Route path="/admin/adminguestprofile" element={<AdminGuestProfile />} />
            <Route path="/admin/adminpayments" element={<AdminPayments />} />
            <Route path="/admin/adminrequestedamenities" element={<AdminRequestedAmenities />} />
            <Route path="/admin/adminreviews" element={<AdminReviews />} />
            <Route path="/admin/admintransactionhistory" element={<AdminTransactionHis />} />
            <Route path="/admin/adminvisitorslog" element={<AdminVisitorsLog />} />
            <Route path="/admin/adminamenitymaster" element={<AdminAmenityMaster />} />
            <Route path="/admin/adminchargescategory" element={<AdminChargesCategory />} />
            <Route path="/admin/adminchargemaster" element={<AdminChargeMaster />} />
            <Route path="/admin/admindiscountmaster" element={<AdminDiscountMaster />} />
            <Route path="/admin/adminroomtypemaster" element={<AdminRoomtype />} />
          </Routes>
        </div>
      </div>
  </Router>
  );
}

export default App;
