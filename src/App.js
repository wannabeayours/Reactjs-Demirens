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
import Footer from './components/layout/Footer';
import { useEffect } from 'react';
import CustomerHeader from './components/layout/CustomerHeader';
import CustomerMain from './pages/customer/CustomerMain';
import { Toaster } from 'sonner';
import { Check, CheckCircle2Icon, XCircleIcon } from 'lucide-react';

// Frontdesk Side
import FrontdeskLogin from './pages/frontdesk/FrontdeskLogin';
import FrontdeskDashboard from './pages/frontdesk/FrontdeskDashboard';
import FrontdeskWalkin from './pages/frontdesk/FrontdeskWalkin';
import FrontdeskReservation from './pages/frontdesk/FrontdeskResvation';
import CustomerRoomView from './pages/customer/CustomerRoomView';
import RoomSearch from './pages/customer/RoomSearch';
import BookingChargesMaster from './pages/frontdesk/BookingChargesMaster';
import BookingRequestList from './pages/frontdesk/BookingListRequest';
import BookingChargesList from './pages/frontdesk/BookingChargesList';
import BookingCreateInvoice from './pages/frontdesk/BookingCreateInvoice';
import BookingDisplayInvoiceSample from './pages/frontdesk/BookingDisplayInvoiceSample';

function App() {

  useEffect(() => {
    if (localStorage.getItem("url") !== "http://localhost/demirenAPI/") {
      localStorage.setItem("url", "http://localhost/demirenAPI/");
    }

    // localStorage.setItem("userId", 2);
    // localStorage.setItem("customerOnlineId", 1);
    
  }, []);



  return (
    <>
    <div className="w-full ">

    </div>
      <Toaster
        position='top-center'
        richColors
        duration={2000}
        icons={{
          success: <CheckCircle2Icon />,
          error: <XCircleIcon />,
        }}

      />
      <Router>
        {/* <div>
        {localStorage.getItem("role") === "admin" ? <AdminHeader />
          : localStorage.getItem("role") === "front" ? <FrontHeader />
            : localStorage.getItem("role") === "customer" ? <CustomerHeader />
              : <LandingHeader />
        } */}
        {/* <LandingHeader /> */}


        <div style={{ flex: 1 }}>
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

            {/* Frontdesk */}
            {/* <Route path="/frontdesk/login" element={<FrontdeskLogin />} />
            <Route path="/frontdesk/dashboard" element={<FrontdeskDashboard />} />
            <Route path="/frontdesk/walkin" element={<FrontdeskWalkin />} />
            <Route path="/frontdesk/reservations" element={<FrontdeskReservation />} /> */}
            {/* <Route path="/frontdesk/reservations" element={<FrontdeskReservation />} /> */}
            <Route path="/BookingChargesMaster" element={<BookingChargesMaster/>} />
          <Route path="/BookingRequestList" element={<BookingRequestList/>} />
          <Route path="/BookingChargesList" element={<BookingChargesList />} />
          <Route path="/BookingCreateInvoice" element={<BookingCreateInvoice />} />
          <Route path="/BookingDisplayInvoiceSample" element={<BookingDisplayInvoiceSample />} />
            {/* Customer Route */}
            
            <Route path="/customer/about" element={<CustomerAbout />} />
            <Route path="/customer/bookings" element={<CustomerBooking />} />
            <Route path="/customer/rooms" element={<CustomerRooms />} />
            <Route path="/customer/gallery" element={<CustomerGallery />} />
            <Route path="/customer/restaurant" element={<CustomerRestaurant />} />
            <Route path="/customer/roomsearch" element={<RoomSearch />} />
            <Route path="/customer/roomview" element={<CustomerRoomView />} />
            <Route path="/customer" element={<CustomerMain />} />
            



          </Routes>
        </div>
        {/* <Footer /> */}

      </Router>
      
    </>
  );



}

export default App;
