import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileText, Settings, CheckCircle, XCircle, Eye, Search, Filter, X, Info } from "lucide-react";
import AdminHeader from "./components/AdminHeader";
import InvoiceManagementSubpage from "./SubPages/InvoiceManagementSubpage";
import { DateFormatter } from './Function_Files/DateFormatter';

function CreateInvoice() {
  const [bookings, setBookings] = useState([]);
  const [loading] = useState(false);
  const [showInvoiceManagement, setShowInvoiceManagement] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalAnimating, setModalAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      console.log("Fetching bookings from URL:", url);
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      console.log("API Response:", res.data);
      setBookings(res.data !== 0 ? res.data : []);
      console.log("Bookings set:", res.data !== 0 ? res.data : []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error("Error loading bookings: " + err.message);
    }
  };

  const handleBookingAction = (booking) => {
    setSelectedBooking(booking);
    setModalAnimating(true);
    setShowInvoiceManagement(true);
    // Reset animation state after modal opens
    setTimeout(() => setModalAnimating(false), 300);
  };

  const handleCloseModal = () => {
    setModalAnimating(true);
    // Delay closing to allow animation
    setTimeout(() => {
      setShowInvoiceManagement(false);
      setSelectedBooking(null);
      setModalAnimating(false);
    }, 200);
  };

  const handleInvoiceCreated = () => {
    fetchBookings(); // Refresh the bookings list
  };

  // Filter bookings based on search query and status filter
  const getFilteredBookings = () => {
    let filteredBookings = bookings;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.booking_id.toString().includes(query) ||
        booking.reference_no.toLowerCase().includes(query) ||
        (booking.customer_name && booking.customer_name.toLowerCase().includes(query)) ||
        (booking.customer_name === null && "walk-in".includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredBookings = filteredBookings.filter(booking => {
        if (statusFilter === "created") {
          return booking.invoice_id !== null && booking.invoice_id !== undefined;
        } else if (statusFilter === "not-created") {
          return booking.invoice_id === null || booking.invoice_id === undefined;
        }
        return true;
      });
    }

    return filteredBookings;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  useEffect(() => {
    fetchBookings();
    
    // Check if there's a reference number to auto-fill from BookingList
    const autoSearchReference = localStorage.getItem('invoiceSearchReference');
    if (autoSearchReference) {
      setSearchQuery(autoSearchReference);
      localStorage.removeItem('invoiceSearchReference'); // Clear after use
    }
  }, []);

  // Debug function to test API connection
  // const testAPIConnection = async () => {
  //   try {
  //     const url = localStorage.getItem("url") + "transactions.php";
  //     const formData = new FormData();
  //     formData.append("operation", "getBookingsWithBillingStatus");
  //     const res = await axios.post(url, formData);
  //     console.log("API Test Response:", res.data);
  //     toast.success("API connection successful!");
  //   } catch (err) {
  //     console.error("API Test Error:", err);
  //     toast.error("API connection failed: " + err.message);
  //   }
  // };
  
  return (
    <div className="lg:ml-72 p-3 lg:p-6 space-y-4 lg:space-y-6 max-w-full overflow-hidden">
      <AdminHeader/>
      {/* Header Section */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-[#34699a] dark:text-[#34699a]" />
              </div>
              <div>
                <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Invoice Management
                </CardTitle>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
                  Comprehensive billing validation and invoice creation system
                </p>
              </div>
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#34699a] focus:border-[#34699a] outline-none w-full"
              >
                <option value="all">All Status</option>
                <option value="created">Created</option>
                <option value="not-created">Not Created</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {getFilteredBookings().length} of {bookings.length} bookings
          </div>
        </CardHeader>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="text-lg lg:text-xl">Booking Invoices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 lg:p-6">
          <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHead className="min-w-[60px] lg:min-w-[80px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">ID</TableHead>
                  <TableHead className="min-w-[100px] lg:min-w-[120px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">Reference</TableHead>
                  <TableHead className="min-w-[100px] lg:min-w-[120px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</TableHead>
                  <TableHead className="min-w-[100px] lg:min-w-[140px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 hidden sm:table-cell">Check-In</TableHead>
                  <TableHead className="min-w-[100px] lg:min-w-[140px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 hidden md:table-cell">Check-Out</TableHead>
                  <TableHead className="min-w-[60px] lg:min-w-[100px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 hidden lg:table-cell">Billing ID</TableHead>
                  <TableHead className="min-w-[80px] lg:min-w-[120px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                  <TableHead className="min-w-[60px] lg:min-w-[100px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 hidden lg:table-cell">Validation</TableHead>
                  <TableHead className="min-w-[80px] lg:min-w-[120px] text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredBookings().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        {bookings.length === 0 
                          ? "No bookings found" 
                          : "No bookings match your search criteria"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredBookings().map((b, index) => (
                  <TableRow key={`booking-${b.booking_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium whitespace-nowrap text-xs lg:text-sm text-gray-900 dark:text-gray-100">
                      {b.booking_id}
                    </TableCell>
                    <TableCell className="font-mono text-xs lg:text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
                      <span className="block lg:hidden">{b.reference_no.substring(0, 8)}...</span>
                      <span className="hidden lg:block">{b.reference_no}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs lg:text-sm text-gray-900 dark:text-gray-100">
                      <span className="block lg:hidden truncate max-w-[80px]">{b.customer_name || "Walk-In"}</span>
                      <span className="hidden lg:block">{b.customer_name || "Walk-In"}</span>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm whitespace-nowrap text-gray-900 dark:text-gray-100 hidden sm:table-cell">
                      {DateFormatter.formatDateOnly(b.booking_checkin_dateandtime)}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm whitespace-nowrap text-gray-900 dark:text-gray-100 hidden md:table-cell">
                      {DateFormatter.formatDateOnly(b.booking_checkout_dateandtime)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs lg:text-sm hidden lg:table-cell">
                      {b.billing_id ? (
                        <Badge variant="outline" className="text-xs">{b.billing_id}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {b.invoice_id ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Created</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Not Created</span>
                          <span className="sm:hidden">✗</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs lg:text-sm text-muted-foreground hidden lg:table-cell">
                        <span>—</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {!b.invoice_id ? (
                        <Button 
                          onClick={() => handleBookingAction(b)}
                          variant="default"
                          size="sm"
                          className="flex items-center gap-1 text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-2"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">Manage</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Created</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Management Modal */}
      {showInvoiceManagement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4">
          {/* Backdrop with animation */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content with enhanced styling */}
          <div className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl max-h-[95vh] w-full overflow-hidden border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out ${
            modalAnimating ? 'animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-4' : 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4'
          }`}>
            {/* Enhanced Modal Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#34699a]/5 to-[#34699a]/10 dark:from-[#34699a]/10 dark:to-[#34699a]/20">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                  <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-[#34699a] flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                    Invoice Management
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    Booking #{selectedBooking?.booking_id} - {selectedBooking?.reference_no}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Close Button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                </Button>
              </div>
            </div>
            
            {/* Information Banner */}
            {selectedBooking && (
              <div className="px-4 lg:px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Managing invoice for <strong>{selectedBooking.customer_name || 'Walk-in Customer'}</strong> 
                    {' '}(Booking #{selectedBooking.booking_id})
                  </span>
                </div>
              </div>
            )}

            {/* Enhanced Modal Body with better scrolling */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)] bg-gray-50/30 dark:bg-gray-800/30">
              {selectedBooking && (
                <div className="p-4 lg:p-6">
                  <InvoiceManagementSubpage
                    selectedBooking={selectedBooking}
                    onClose={handleCloseModal}
                    onInvoiceCreated={handleInvoiceCreated}
                  />
                </div>
              )}
            </div>
            
            {/* Modal Footer with enhanced styling */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Invoice management system active</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInvoice;