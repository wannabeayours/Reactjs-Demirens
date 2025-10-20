import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';


// ------------------------------------------------------------ Admin Side Here ------------------------------------------------------------
import AdminRouteGuard from './pages/admin/components/AdminRouteGuard';
import AdminRoomsList from './pages/admin/RoomsList';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminBookingList from './pages/admin/BookingList';
import AdminCalendar from './pages/admin/Calendar';
import AdminGuestProfile from './pages/admin/GuestProfile';
import AdminPayments from './pages/admin/Payments';
import AdminRequestedAmenities from './pages/admin/RequestedAmenities';
import AdminBookingRoomSelection from './pages/admin/SubPages/BookingRoomSelection';
import AdminReviews from './pages/admin/Reviews';
import AdminTransactionHis from './pages/admin/TransactionHis';
import AdminVisitorsLog from './pages/admin/VisitorsLog';
import AdminAmenityMaster from './pages/admin/Master_Files/AmenityMaster';
import AdminChargesCategory from './pages/admin/Master_Files/ChargesCategory';
import AdminChargeMaster from './pages/admin/Master_Files/ChargeMaster';
import AdminDiscountMaster from './pages/admin/Master_Files/DiscountMaster';
import AdminRoomtype from './pages/admin/Master_Files/RoomTypeMaster';
import AdminNewBook from './pages/admin/WalkIn_Folder/AddWalkIn';
import Landingpage from './pages/Landingpage';
import Billings from './pages/admin/Billings';
import CreateInvoice from './pages/admin/Invoice';
import EmployeeList from './pages/admin/EmployeeList';
import ChooseBookForVisitor from './pages/admin/SubPages/ChooseBookForVisitor';

// Online
import OnlineReqList from './pages/admin/Online_Folder/OnlineReqList';
import { ApprovalProvider } from './pages/admin/Online_Folder/ApprovalContext';
import ApprovalReceipt from './pages/admin/Online_Folder/ApprovalReceipt';

// Walk In
import AddWalkIn from './pages/admin/WalkIn_Folder/AddWalkIn';
import ChooseRooms from './pages/admin/WalkIn_Folder/ChooseRooms';
import PaymentMethod from './pages/admin/WalkIn_Folder/PaymentMethod';
import Confirmation from './pages/admin/WalkIn_Folder/Confirmation';
import { WalkInProvider } from './pages/admin/WalkIn_Folder/WalkInContext';


// ------------------------------------------------------------ User Auth Side Here ------------------------------------------------------------
import Login from './pages/UserAuth_Folder/Login';
import EmployeeLogin from './pages/UserAuth_Folder/Login_Employees';
import Register from './pages/UserAuth_Folder/Register';
import OTPAuth from './pages/UserAuth_Folder/OTP_Auth';
import ForgotPassword from './pages/UserAuth_Folder/ForgotPassword';
import ResetPassword from './pages/UserAuth_Folder/ResetPassword';

// ------------------------------------------------------------ Customer Side Here ------------------------------------------------------------
import RoomSearch from './pages/customer/RoomSearch';
import CustomerRoomView from './pages/customer/CustomerRoomView';
import CustomerAbout from './pages/customer/CustomerAbout';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerRooms from './pages/customer/CustomerRooms';
import CustomerGallery from './pages/customer/CustomerGallery';
import CustomerRestaurant from './pages/customer/CustomerRestaurant';
import { useEffect } from 'react';
import CustomerMain from './pages/customer/CustomerMain';
import { Toaster } from 'sonner';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { SuccessPayment } from './pages/customer/modals/sheets/pages/SuccessPayment';
import { CancelledPayment } from './pages/customer/modals/sheets/pages/CancelledPayment';


function App() {

  useEffect(() => {
    if (localStorage.getItem("url") !== "http://localhost/demirenAPI/api/") {
      localStorage.setItem("url", "http://localhost/demirenAPI/api/");
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


        <div style={{ flex: 1 }}>

          <WalkInProvider>
            <ApprovalProvider>

              <Routes>

                {/* Auth Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/employee/login" element={<EmployeeLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<OTPAuth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Landing Page */}
                <Route path="/" element={<Landingpage />} />

                {/* Protected Admin Pages */}
                <Route path="/admin/dashboard" element={
                  <AdminRouteGuard>
                    <AdminDashboard />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/profile" element={
                  <AdminRouteGuard>
                    <AdminProfile />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/roomslist" element={
                  <AdminRouteGuard>
                    <AdminRoomsList />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/bookinglist" element={
                  <AdminRouteGuard>
                    <AdminBookingList />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/newbook" element={
                  <AdminRouteGuard>
                    <AdminNewBook />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/calendar" element={
                  <AdminRouteGuard>
                    <AdminCalendar />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/guestprofile" element={
                  <AdminRouteGuard>
                    <AdminGuestProfile />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/payments" element={
                  <AdminRouteGuard>
                    <AdminPayments />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/requestedamenities" element={
                  <AdminRouteGuard>
                    <AdminRequestedAmenities />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/bookingroomselection" element={
                  <AdminRouteGuard>
                    <AdminBookingRoomSelection />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/reviews" element={
                  <AdminRouteGuard>
                    <AdminReviews />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/transactionhistory" element={
                  <AdminRouteGuard>
                    <AdminTransactionHis />
                  </AdminRouteGuard>
                } />

                <Route path="/admin/choosebookforvisitor" element={
                  <AdminRouteGuard>
                    <ChooseBookForVisitor />
                  </AdminRouteGuard>
                } />

                <Route path="/admin/visitorslog" element={
                  <AdminRouteGuard>
                    <AdminVisitorsLog />
                  </AdminRouteGuard>
                } />

                <Route path="/admin/amenitymaster" element={
                  <AdminRouteGuard>
                    <AdminAmenityMaster />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/chargescategory" element={
                  <AdminRouteGuard>
                    <AdminChargesCategory />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/chargemaster" element={
                  <AdminRouteGuard>
                    <AdminChargeMaster />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/discountmaster" element={
                  <AdminRouteGuard>
                    <AdminDiscountMaster />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/roomtypemaster" element={
                  <AdminRouteGuard>
                    <AdminRoomtype />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/employeelist" element={
                  <AdminRouteGuard>
                    <EmployeeList />
                  </AdminRouteGuard>
                } />

                <Route path="/admin/billings" element={
                  <AdminRouteGuard>
                    <Billings />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/invoice" element={
                  <AdminRouteGuard>
                    <CreateInvoice />
                  </AdminRouteGuard>
                } />

                {/* Protected Online Pages */}
                <Route path="/admin/online" element={
                  <AdminRouteGuard>
                    <OnlineReqList />
                  </AdminRouteGuard>
                } />
                {/* Route temporarily disabled: ApproveRooms component missing */}
                {/* <Route path="/admin/approve/:bookingId" element={
                  <AdminRouteGuard>
                    <ApproveRooms />
                  </AdminRouteGuard>
                } /> */}
                <Route path="/admin/receipt/:bookingId" element={
                  <AdminRouteGuard>
                    <ApprovalReceipt />
                  </AdminRouteGuard>
                } />

                {/* Protected WalkIn Pages */}
                <Route path="/admin/add-walk-in" element={
                  <AdminRouteGuard>
                    <AddWalkIn />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/choose-rooms" element={
                  <AdminRouteGuard>
                    <ChooseRooms />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/payment-method" element={
                  <AdminRouteGuard>
                    <PaymentMethod />
                  </AdminRouteGuard>
                } />
                <Route path="/admin/confirmation" element={
                  <AdminRouteGuard>
                    <Confirmation />
                  </AdminRouteGuard>
                } />
                
                {/* Customer Route */}
                <Route path="/customer/roomview" element={<CustomerRoomView />} />
                <Route path="/customer/roomsearch" element={<RoomSearch />} />
                <Route path="/customer/about" element={<CustomerAbout />} />
                <Route path="/customer/bookings" element={<CustomerBooking />} />
                <Route path="/customer/rooms" element={<CustomerRooms />} />
                <Route path="/customer/gallery" element={<CustomerGallery />} />
                <Route path="/customer/restaurant" element={<CustomerRestaurant />} />
                <Route path="/customer" element={<CustomerMain />} />
                <Route path="/payment-success" element={<SuccessPayment />} />
                <Route path="/payment-cancelled" element={<CancelledPayment />} />


              </Routes>
            </ApprovalProvider>
          </WalkInProvider>

        </div>
        {/* <Footer /> */}

      </Router>

    </>
  );



}

export default App;
