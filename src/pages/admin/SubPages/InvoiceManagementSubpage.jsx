import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, CheckCircle, AlertCircle, Calculator, Receipt, CreditCard, DollarSign as DollarSignIcon, Eye, X, ChevronDown, ChevronUp, ExternalLink, CalendarPlus } from "lucide-react";
import NumberFormatter from "../Function_Files/NumberFormatter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>

function InvoiceManagementSubpage({ 
  selectedBooking, 
  onClose, 
  onInvoiceCreated 
}) {
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'billing', 'invoice'
  const [billingBreakdown, setBillingBreakdown] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [bookingCharges, setBookingCharges] = useState([]);
  const [detailedCharges, setDetailedCharges] = useState(null);
  const [showDetailedCharges, setShowDetailedCharges] = useState(false);
  const [newChargeForm, setNewChargeForm] = useState({
    charge_name: '',
    charge_price: '',
    quantity: 1,
    category_id: 4
  });
  const [invoiceForm, setInvoiceForm] = useState({
    payment_method_id: 2,
    discount_id: null,
    vat_rate: 0,
    downpayment: 0,
    invoice_status_id: 1
  });
  const [isBookingInfoOpen, setIsBookingInfoOpen] = useState(false);
  const [isRoomDetailsExpanded, setIsRoomDetailsExpanded] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerSrc, setImageViewerSrc] = useState('');
  const [billingData, setBillingData] = useState([]);
  // Add delivery modal states
  // Restore delivery modal default to 'both' so user can pick
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('both');
  const [emailTo, setEmailTo] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [lastPdfUrl, setLastPdfUrl] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  // Fetch billing amounts when Booking Information modal opens
  useEffect(() => {
    if (isBookingInfoOpen && selectedBooking?.booking_id) {
      calculateBillingBreakdown(selectedBooking.booking_id);
    }
  }, [isBookingInfoOpen, selectedBooking?.booking_id]);

  // Sync default email with selected booking
  useEffect(() => {
    const resolvedEmail = selectedBooking?.customer_email || selectedBooking?.customers_email || selectedBooking?.email || '';
    console.log('[InvoiceManagement] selectedBooking changed:', {
      booking_id: selectedBooking?.booking_id,
      reference_no: selectedBooking?.reference_no,
      customer_email: selectedBooking?.customer_email,
      customers_email: selectedBooking?.customers_email,
      email: selectedBooking?.email,
      resolvedEmail,
    });
    setEmailTo(resolvedEmail);
  }, [selectedBooking]);

  // Fetch discounts when component mounts
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const url = localStorage.getItem("url") + "admin.php";
      const formData = new FormData();
      formData.append("method", "getEnabledDiscounts");
      
      const res = await axios.post(url, formData);
      if (res.data?.success) {
        setDiscounts(res.data.data || []);
      } else {
        console.error("Failed to fetch discounts:", res.data?.error);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // Helper: get current logged-in employee ID from localStorage
  const getCurrentEmployeeId = () => {
    // Prefer employee-specific keys first, then generic user keys, admin last
    const keys = ["employee_id", "employeeId", "userId", "user_id", "userID", "admin_id"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw && /^\d+$/.test(raw)) {
        const id = parseInt(raw, 10);
        if (id > 0) return id;
      }
    }
    return 1; // Fallback to admin if none found
  };

  // Helper functions for room type grouping
  const groupRoomsByType = (rooms) => {
    if (!rooms || !Array.isArray(rooms)) return {};
    
    return rooms.reduce((acc, room) => {
      const type = room.room_type || 'Unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(room);
      return acc;
    }, {});
  };

  const handleImageClick = (imageSrc) => {
    setImageViewerSrc(imageSrc);
    setIsImageViewerOpen(true);
  };

  const validateBilling = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "validateBillingCompleteness");
      formData.append("json", JSON.stringify({ booking_id: bookingId }));
      
      const res = await axios.post(url, formData);
      setValidationResult(res.data);
      return res.data;
    } catch (err) {
      toast.error("Error validating billing");
      return { success: false, message: "Validation failed" };
    }
  };

  const createBillingRecord = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "createBillingRecord");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        employee_id: getCurrentEmployeeId()
      }));
      
      const res = await axios.post(url, formData);
      return res.data?.success || false;
    } catch (err) {
      console.error("Error creating billing record:", err);
      return false;
    }
  };

  const calculateBillingBreakdown = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "calculateComprehensiveBilling");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: 0,
        downpayment: 0
      }));
      
      console.log("Calculating billing breakdown for booking:", bookingId);
      const res = await axios.post(url, formData);
      console.log("Billing breakdown API response:", res.data);
      
      // Automatically set invoice status to "Complete" for checkout scenarios
      setInvoiceForm(prevForm => ({
        ...prevForm,
        invoice_status_id: 1 // 1 = Complete
      }));
      
      setBillingBreakdown(res.data);
      return res.data;
    } catch (err) {
      console.error("Error calculating billing breakdown:", err);
      toast.error("Error calculating billing breakdown: " + err.message);
      return null;
    }
  };

  const handleCreateInvoice = async (booking) => {
    console.log("handleCreateInvoice called with booking:", booking);
    
    try {
      // Step 1: Check if billing exists, if not create it
      if (!booking.billing_id) {
        console.log("No billing_id found, creating billing record...");
        toast.info("Creating billing record...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        toast.success("Billing record created! Refreshing data...");
      }

      console.log("Billing_id found:", booking.billing_id);
      toast.info("Validating billing...");

      // Step 2: Validate billing completeness
      const validation = await validateBilling(booking.booking_id);
      console.log("Validation result:", validation);
      if (!validation.success) {
        toast.error(validation.message);
        return;
      }

      // Only block if there are truly pending charges (status = 1)
      // Charges added by front-desk staff (status = 2) should be allowed for billing
      if (validation.pending_charges > 0) {
        toast.warning(validation.message);
        return;
      }

      // Show warning if no rooms assigned but continue anyway
      if (validation.assigned_rooms === 0) {
        toast.warning("Note: No rooms assigned to this booking yet. Invoice will be created with current charges only.");
      }

      console.log("Billing validation passed, calculating breakdown...");
      toast.info("Calculating billing breakdown...");

      // Step 3: Calculate billing breakdown
      const breakdown = await calculateBillingBreakdown(booking.booking_id);
      console.log("Billing breakdown:", breakdown);
      if (!breakdown || !breakdown.success) {
        toast.error("Failed to calculate billing breakdown: " + (breakdown?.message || "Unknown error"));
        return;
      }

      console.log("Opening invoice view...");
      toast.success("Billing breakdown calculated successfully!");
      setCurrentView('invoice');
    } catch (error) {
      console.error("Error in handleCreateInvoice:", error);
      toast.error("An error occurred while preparing invoice creation: " + error.message);
    }
  };

  const handleCreateBilling = async (booking) => {
    console.log("handleCreateBilling called with booking:", booking);
    
    try {
      // If no billing_id exists, create billing record first
      if (!booking.billing_id) {
        console.log("No billing_id found, creating billing record first...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        toast.success("Billing record created successfully!");
      }

      // Load all charges for this booking
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: booking.booking_id }));
      
      console.log("Loading charges for booking:", booking.booking_id);
      const res = await axios.post(url, formData);
      console.log("Charges response:", res.data);
      
      if (res.data.success) {
        setBookingCharges(res.data.charges);
        setCurrentView('billing');
        toast.success(`Found ${res.data.total_charges_count} charges for this booking`);
      } else {
        toast.error("Failed to load charges: " + res.data.message);
      }
    } catch (error) {
      console.error("Error in handleCreateBilling:", error);
      toast.error("Error loading billing information: " + error.message);
    }
  };

  const handleAddCharge = async () => {
    if (!newChargeForm.charge_name || !newChargeForm.charge_price) {
      toast.error("Please fill in charge name and price");
      return;
    }

    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "addBookingCharge");
      formData.append("json", JSON.stringify({
        booking_id: selectedBooking.booking_id,
        charge_name: newChargeForm.charge_name,
        charge_price: parseFloat(newChargeForm.charge_price),
        quantity: parseInt(newChargeForm.quantity),
        category_id: newChargeForm.category_id
      }));
      
      console.log("Adding charge:", newChargeForm);
      const res = await axios.post(url, formData);
      console.log("Add charge response:", res.data);
      
      if (res.data.success) {
        toast.success("Charge added successfully!");
        // Reset form
        setNewChargeForm({
          charge_name: '',
          charge_price: '',
          quantity: 1,
          category_id: 4
        });
        // Reload charges
        handleCreateBilling(selectedBooking);
      } else {
        toast.error("Failed to add charge: " + res.data.message);
      }
    } catch (error) {
      console.error("Error adding charge:", error);
      toast.error("Error adding charge: " + error.message);
    }
  };

  const proceedToInvoice = () => {
    console.log("proceedToInvoice called with selectedBooking:", selectedBooking);
    setCurrentView('invoice');
    handleCreateInvoice(selectedBooking);
  };

  const loadDetailedCharges = async () => {
    if (!selectedBooking) return;
    
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getDetailedBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: selectedBooking.booking_id }));
      
      console.log("Loading detailed charges for booking:", selectedBooking.booking_id);
      const res = await axios.post(url, formData);
      console.log("Detailed charges response:", res.data);
      
      if (res.data.success) {
        setDetailedCharges(res.data);
        setShowDetailedCharges(true);
        toast.success("Detailed charges loaded successfully!");
      } else {
        toast.error("Failed to load detailed charges: " + res.data.message);
      }
    } catch (error) {
      console.error("Error loading detailed charges:", error);
      toast.error("Error loading detailed charges: " + error.message);
    }
  };

  // Invoice Creation Logic (open modal first)
  const confirmCreateInvoice = () => {
    setShowDeliveryModal(true);
  };

  // Helper: preflight check to ensure browser can fetch blobs from API origin
  const canDownloadFromApi = async () => {
    try {
      const baseUrl = localStorage.getItem("url");
      if (!baseUrl) return false;
      // Ping the backend download endpoint to verify API availability
      await axios.get(baseUrl + "download_invoice.php?ping=1", { timeout: 4000 });
      return true;
    } catch (err) {
      return false;
    }
  };

  const performCreateInvoiceWithDelivery = async () => {
    if (!selectedBooking) return;
    setSubmittingInvoice(true);
    setLoading(true);
    try {
      // New primary path: use server-side generator to create and stream the PDF
      const baseUrl = localStorage.getItem("url") || "";
      const params = new URLSearchParams({
        booking_id: String(selectedBooking.booking_id),
        delivery_mode: deliveryMode,
        stream: "1",
      });
      if (emailTo && emailTo.trim()) { params.set("email_to", emailTo.trim()); }
      const genUrl = baseUrl + "generate-invoice.php?" + params.toString();
      console.log("Generate & stream URL:", genUrl);
      setLastPdfUrl(genUrl);
      toast.message("Starting download...", { description: "Generating your invoice PDF" });
      // Hard navigation ensures download prompt in all browsers
      window.location.href = genUrl;

      // Keep the original API call to update DB state and UI feedback
      const employee_id = getCurrentEmployeeId();
      const jsonData = {
        booking_id: selectedBooking.booking_id,
        employee_id,
        payment_method_id: invoiceForm.payment_method_id,
        invoice_status_id: invoiceForm.invoice_status_id,
        discount_id: invoiceForm.discount_id,
        vat_rate: 0,
        downpayment: 0,
        delivery_mode: deliveryMode,
        email_to: emailTo?.trim() || undefined,
      };

      const formData = new FormData();
      formData.append("operation", "createInvoice");
      formData.append("json", JSON.stringify(jsonData));

      const url = baseUrl + "transactions.php";
      const res = await axios.post(url, formData);

      if (res.data?.success) {
        toast.success(res.data.message || "Invoice created successfully!");
        const info = Array.isArray(res.data.results) ? res.data.results[0] : null;
        if (info?.email_status) {
          toast.info(`Email: ${info.email_status}`);
        }
        // Secondary path: if generator failed, try direct server download
        if (info?.pdf_url) {
          const filenameFromUrl = (info.pdf_url.split("/").pop() || `invoice_${selectedBooking.booking_id}_${info.invoice_id}.pdf`).replace(/\?.*$/, "");
          const dlUrl = baseUrl + "download_invoice.php?file=" + encodeURIComponent(filenameFromUrl);
          console.log("Invoice PDF URL:", info.pdf_url);
          console.log("Server download URL:", dlUrl);
          setLastPdfUrl(dlUrl);
        }
        onInvoiceCreated && onInvoiceCreated();
        onClose && onClose();
      } else {
        toast.error(res.data?.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Error creating invoice: " + (error?.message || "Unknown error"));
    } finally {
      setSubmittingInvoice(false);
      setLoading(false);
    }
  };

  const retryDownloadLastInvoice = async () => {
    if (!lastPdfUrl) return;
    try {
      window.location.href = lastPdfUrl;
    } catch (err) {
      // As a final fallback, try opening the direct pdf_url if we logged it earlier
      // The lastPdfUrl is server route; we cannot recover the direct URL here without state
    }
  };

  const handleClose = () => {
    setCurrentView('menu');
    setBillingBreakdown(null);
    setValidationResult(null);
    setDetailedCharges(null);
    setShowDetailedCharges(false);
    setBookingCharges([]);
    setNewChargeForm({
      charge_name: '',
      charge_price: '',
      quantity: 1,
      category_id: 4
    });
    onClose();
  };

  const resetToMenu = () => {
    setCurrentView('menu');
    setBillingBreakdown(null);
    setValidationResult(null);
    setDetailedCharges(null);
    setShowDetailedCharges(false);
    setBookingCharges([]);
  };

  // Main Menu View
  const renderMenuView = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Action
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Booking #{selectedBooking?.booking_id} - {selectedBooking?.reference_no}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsBookingInfoOpen(true)}
            className="whitespace-nowrap"
          >
            See Booking Information
          </Button>
        </div>

        {/* Booking Information Modal */}
        <Dialog open={isBookingInfoOpen} onOpenChange={setIsBookingInfoOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader className="text-center pb-4 border-b">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Booking Information
                {selectedBooking && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-3">
                    #{selectedBooking.booking_id || 'N/A'}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6 mt-4">
                {/* Uploaded File Section */}
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Uploaded File
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No file uploaded for this booking.
                  </div>
                </div>

                {/* Booking Information Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarPlus className="h-5 w-5" />
                    Booking Information
                  </h3>
                  
                  {/* Status and Reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Reference Number</div>
                      <div className="font-bold text-gray-900 dark:text-white">{selectedBooking.reference_no || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Booking Status</div>
                      <Badge variant="outline" className="text-xs">
                        {selectedBooking.booking_status || 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Customer</div>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedBooking.customer_name || 'Walk-In'}</div>
                    </div>
                  </div>

                  {/* Dates and Times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Check-In Date</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.booking_checkin_dateandtime ? formatDateTime(selectedBooking.booking_checkin_dateandtime) : '—'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Check-Out Date</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.booking_checkout_dateandtime ? formatDateTime(selectedBooking.booking_checkout_dateandtime) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Remaining Balance */}
                  <div className="mb-6">
                    <div className="rounded-lg border px-4 py-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Total Amount</span>
                        <span className="font-mono font-semibold">
                          {NumberFormatter.formatCurrency(parseFloat(billingBreakdown?.final_total || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Payment</span>
                        <span className="font-mono font-semibold text-red-600">
                          -{NumberFormatter.formatCurrency(parseFloat(billingBreakdown?.downpayment || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium">Remaining Balance</span>
                        <span className="font-mono font-semibold text-red-600">
                          {NumberFormatter.formatCurrency(
                            parseFloat(
                              billingBreakdown?.balance ?? ((billingBreakdown?.final_total || 0) - (billingBreakdown?.downpayment || 0))
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room Details Section */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setIsRoomDetailsExpanded(!isRoomDetailsExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white">Room Details</h4>
                      {isRoomDetailsExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    
                    {isRoomDetailsExpanded && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedBooking.roomtype_name || 'Room Type'}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Room: {selectedBooking.room_numbers || '—'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Rate: {NumberFormatter.formatCurrency(parseFloat(selectedBooking.balance || 0))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </DialogContent>
        </Dialog>

        {/* Image Viewer Modal */}
        <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-2">
            <DialogHeader>
              <DialogTitle className="text-center">Image Viewer</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center">
              <img 
                src={imageViewerSrc} 
                alt="Booking file" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* Review Billing Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Calculator className="h-6 w-6" />
                Review Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Review current charges, add new charges, and manage billing details for this booking.
              </p>
              <Button 
                onClick={() => handleCreateBilling(selectedBooking)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Billing Details
              </Button>
            </CardContent>
          </Card>

          {/* Create Invoice Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-green-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Receipt className="h-6 w-6" />
                Create Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Generate the final invoice with billing breakdown and payment details.
              </p>
              <Button 
                onClick={() => handleCreateInvoice(selectedBooking)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Create Final Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Billing Review View
  const renderBillingView = () => (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review Billing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Booking #{selectedBooking?.booking_id} - {selectedBooking?.reference_no}
            </p>
          </div>
          <Button
            onClick={resetToMenu}
            variant="outline"
          >
            Back to Menu
          </Button>
        </div>

        {/* Current Charges - Top Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Current Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingCharges.map((charge, index) => (
                    <TableRow key={index}>
                      <TableCell>{charge.charge_type}</TableCell>
                      <TableCell>{charge.charge_name}</TableCell>
                      <TableCell>{charge.category}</TableCell>
<TableCell className="text-right font-mono">{NumberFormatter.formatCurrency(charge.unit_price)}</TableCell>
<TableCell className="text-center">{charge.quantity}</TableCell>
<TableCell className="text-right font-mono font-bold">{NumberFormatter.formatCurrency(charge.total_amount)}</TableCell>
                    </TableRow>
                  ))}
                  {bookingCharges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center text-muted-foreground">
                        No charges found for this booking
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Total Summary */}
            {bookingCharges.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-right">
                <span className="font-bold text-xl">
                  Current Total: {NumberFormatter.formatCurrency(bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0))}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Charge - Bottom Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Charge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="charge_name">Charge Description</Label>
                <Input
                  id="charge_name"
                  type="text"
                  placeholder="e.g., Aircon Damage, TV Repair, Broken Vase"
                  value={newChargeForm.charge_name}
                  onChange={(e) => setNewChargeForm({...newChargeForm, charge_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="charge_price">Price</Label>
                <Input
                  id="charge_price"
                  type="text"
                  placeholder="0.00"
                  value={newChargeForm.charge_price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setNewChargeForm({...newChargeForm, charge_price: value});
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="text"
                  value={newChargeForm.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setNewChargeForm({...newChargeForm, quantity: parseInt(value) || 1});
                    }
                  }}
                  min="1"
                />
              </div>
              <div>
                <Button 
                  onClick={handleAddCharge}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Charge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6 pb-6">
          <Button 
            onClick={proceedToInvoice}
            disabled={bookingCharges.length === 0}
            className="flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" />
            Proceed to Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );

  // Invoice Creation View
  const renderInvoiceView = () => (
    <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 rounded-lg">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Invoice
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Booking #{selectedBooking?.booking_id} - {selectedBooking?.reference_no}
            </p>
          </div>
          <Button
            onClick={resetToMenu}
            variant="outline"
          >
            Back to Menu
          </Button>
        </div>

        {/* Validation Results - Top Section */}
        {validationResult && (
          <Card className={`mb-6 ${validationResult.is_complete ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {validationResult.is_complete ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold text-lg">Validation Status</span>
              </div>
              <p className="text-base mb-3">{validationResult.message}</p>
              <div className="flex gap-3">
                {validationResult.pending_charges > 0 && (
                  <Badge variant="outline" className="text-sm">
                    Pending Charges: {validationResult.pending_charges}
                  </Badge>
                )}
                {validationResult.assigned_rooms > 0 && (
                  <Badge variant="outline" className="text-sm">
                    Assigned Rooms: {validationResult.assigned_rooms}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Breakdown - Middle Section */}
        {billingBreakdown && billingBreakdown.success && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Billing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingBreakdown ? (
                <div className="space-y-4">
                  {/* Arrange as a single vertical calculation list */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Room Charges with VAT(12%):</span>
                      <span className="font-mono font-semibold">{NumberFormatter.formatCurrency(billingBreakdown.room_total)}</span>
                    </div>
                    {(parseFloat(billingBreakdown.charge_total) || 0) > 0 && (
                      <div className="flex justify-between items-center py-3 border-b-2 border-gray-300 dark:border-gray-700">
                        <span className="font-medium">Additional Charges:</span>
                        <span className="font-mono font-semibold">{NumberFormatter.formatCurrency(billingBreakdown.charge_total)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-mono font-semibold">{NumberFormatter.formatCurrency(billingBreakdown.subtotal)}</span>
                    </div>
                    {(parseFloat(billingBreakdown.discount_amount) || 0) > 0 && (
                      <div className="flex justify-between items-center py-3 border-b-2 border-gray-300 dark:border-gray-700">
                        <span className="font-medium">Discount:</span>
                        <span className="font-mono font-semibold text-red-600">-{NumberFormatter.formatCurrency(billingBreakdown.discount_amount)}</span>
                      </div>
                    )}
                    {(parseFloat(billingBreakdown.discount_amount) || 0) > 0 && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="font-medium">Amount After Discount:</span>
                        <span className="font-mono font-semibold">{NumberFormatter.formatCurrency(billingBreakdown.amount_after_discount)}</span>
                      </div>
                    )}
                    
                  </div>
                  
                    <div className="space-y-2 bg-muted rounded-lg px-4 py-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl">Total Bill Amount:</span>
                        <span className="font-mono font-bold text-xl">{NumberFormatter.formatCurrency(billingBreakdown.final_total)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Paid:</span>
                        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{NumberFormatter.formatCurrency(billingBreakdown.downpayment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Remaining Balance:</span>
                        <span className="font-mono font-semibold text-red-600">{NumberFormatter.formatCurrency(billingBreakdown.balance)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                        <span className="font-bold text-lg">Balance Due:</span>
                        <span className="font-mono font-bold text-lg text-yellow-800 dark:text-yellow-200">{NumberFormatter.formatCurrency(billingBreakdown.balance || ((billingBreakdown.final_total || 0) - (billingBreakdown.downpayment || 0)))}</span>
                      </div>
                    </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading billing breakdown...</p>
              )}

              {/* Detailed Charges Button */}
              <div className="mt-6 text-center">
                <Button 
                  onClick={loadDetailedCharges}
                  className="mb-4"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Detailed Charges Breakdown
                </Button>
                
                {showDetailedCharges && detailedCharges && (
                  <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="text-center text-blue-600 dark:text-blue-400">
                        <Calculator className="h-5 w-5 inline mr-2" />
                        Detailed Charges Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Room Charges Section */}
                      {detailedCharges.room_charges && detailedCharges.room_charges.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b-2 border-blue-200 dark:border-blue-800 font-semibold">
                            🏨 Room Charges Details
                          </h5>
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                                  <TableHead>Room Type</TableHead>
                                  <TableHead>Room Number</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead className="text-right">Unit Price</TableHead>
                                  <TableHead className="text-center">Stays</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {detailedCharges.room_charges.map((room, index) => (
                                  <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                                    <TableCell>{room.charge_name}</TableCell>
                                    <TableCell>{room.room_number || 'Not Assigned'}</TableCell>
                                    <TableCell>{room.category}</TableCell>
                                    <TableCell className="text-right font-mono">{NumberFormatter.formatCurrency(parseFloat(room.unit_price) || 0)}</TableCell>
                                    <TableCell className="text-center">{room.quantity}</TableCell>
                                    <TableCell className="text-right font-bold font-mono">
                                      {NumberFormatter.formatCurrency(parseFloat(room.total_amount) || 0)}
                                    </TableCell>
                                    <TableCell>{room.charges_master_description || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-right">
                            <span className="font-bold text-lg">
                              🏨 Room Total: {NumberFormatter.formatCurrency(detailedCharges.summary.room_total)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Additional Charges Section */}
                      {detailedCharges.additional_charges && detailedCharges.additional_charges.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-green-600 dark:text-green-400 mb-4 pb-2 border-b-2 border-green-200 dark:border-green-800 font-semibold">
                            🛍️ Additional Charges Details
                          </h5>
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-green-50 dark:bg-green-900/20">
                                  <TableHead>Charge Name</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Room</TableHead>
                                  <TableHead className="text-right">Unit Price</TableHead>
                                  <TableHead className="text-center">Quantity</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {detailedCharges.additional_charges.map((charge, index) => (
                                  <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                                    <TableCell>{charge.charge_name}</TableCell>
                                    <TableCell>{charge.category}</TableCell>
                                    <TableCell>{charge.room_number || charge.room_type}</TableCell>
                                    <TableCell className="text-right font-mono">{NumberFormatter.formatCurrency(parseFloat(charge.unit_price) || 0)}</TableCell>
                                    <TableCell className="text-center">{charge.quantity}</TableCell>
                                    <TableCell className="text-right font-bold font-mono">
                                      {NumberFormatter.formatCurrency(parseFloat(charge.total_amount) || 0)}
                                    </TableCell>
                                    <TableCell>{charge.charges_master_description || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-right">
                            <span className="font-bold text-lg">
                              🛍️ Additional Total: {NumberFormatter.formatCurrency(detailedCharges.summary.charges_total)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Summary Section */}
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Subtotal Breakdown</h6>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Room Charges:</span>
                                <span>{NumberFormatter.formatCurrency(detailedCharges.summary.room_total)}</span>
                              </div>
                              {(detailedCharges.summary.charges_total || 0) > 0 && (
                                <div className="flex justify-between">
                                  <span>Additional Charges:</span>
                                  <span>{NumberFormatter.formatCurrency(detailedCharges.summary.charges_total)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Subtotal:</span>
                                <span>{NumberFormatter.formatCurrency(detailedCharges.summary.subtotal)}</span>
                              </div>
                            </div>
                          </div>
                          
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h6 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Payment</h6>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Downpayment:</span>
                                    <span className="text-blue-700 font-semibold">{NumberFormatter.formatCurrency(parseFloat(detailedCharges.summary.downpayment) || 0)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold border-t pt-1 text-lg">
                                    <span>Balance Due:</span>
                                    <span className="text-red-600">{NumberFormatter.formatCurrency((parseFloat(detailedCharges.summary.balance) || ((parseFloat(detailedCharges.summary.grand_total) || 0) - (parseFloat(detailedCharges.summary.downpayment) || 0))))}</span>
                                  </div>
                                </div>
                              </div>
                        </div>
                        
                        {/* Grand Total */}
                        <div className="p-5 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                          <span className="font-bold text-xl">
                            💰 Total Bill Amount: {NumberFormatter.formatCurrency(detailedCharges.summary.grand_total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Details - Bottom Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  value={invoiceForm.payment_method_id.toString()} 
                  onValueChange={(value) => setInvoiceForm({...invoiceForm, payment_method_id: parseInt(value, 10)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">GCash</SelectItem>
                    <SelectItem value="2">Paypal</SelectItem>
                    <SelectItem value="3">Cash</SelectItem>
                    <SelectItem value="4">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (Optional)</Label>
                <Select 
                  value={invoiceForm.discount_id !== null ? invoiceForm.discount_id.toString() : "none"} 
                  onValueChange={(value) => setInvoiceForm({...invoiceForm, discount_id: value === "none" ? null : parseInt(value, 10)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    {discounts.map((discount) => (
                      <SelectItem key={discount.discount_id} value={String(discount.discount_id)}>
                        {discount.discount_name} - {discount.discount_percentage ? `${discount.discount_percentage}%` : `₱${discount.discount_amount}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              
            </div>

            {/* Action Button */}
            <div className="flex flex-col items-center mt-6">
              <Button 
                onClick={confirmCreateInvoice}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    Create Invoice
                  </>
                )}
              </Button>
              {lastPdfUrl && (
                <button type="button" className="mt-3 text-sm text-blue-600 hover:underline" onClick={retryDownloadLastInvoice}>
                  Invoice not downloaded? Click to download again
                </button>
              )}
            </div>

            {/* Delivery Choice Modal */}
            {showDeliveryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeliveryModal(false)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Choose where to submit the customer's invoice</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Select a delivery option. Email will use the customer's saved address.</p>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email recipient</p>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {emailTo || selectedBooking?.customer_email || selectedBooking?.customers_email || selectedBooking?.email || 'No email on file'}
                    </div>
                    <p className="text-xs text-muted-foreground">This uses the customer's saved email.</p>
                  </div>

                  {/* Allow admin/employee to type a different recipient email */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="customEmail" className="text-sm font-medium">Send to a different email (optional)</Label>
                    <Input
                      id="customEmail"
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="Enter recipient email"
                    />
                    <p className="text-xs text-muted-foreground">If the customer has multiple emails, type one here to override.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 justify-items-center">

                    <Button className="w-full bg-[#34699a] hover:bg-[#2c5b86]" onClick={() => { setDeliveryMode('both'); performCreateInvoiceWithDelivery(); }} disabled={submittingInvoice || !(emailTo && emailTo.trim())}>
                      Email and Print Invoice
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowDeliveryModal(false)} disabled={submittingInvoice}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add bottom padding */}
        <div className="pb-6"></div>
      </div>
    </div>
  );

  // Main render logic
  switch (currentView) {
    case 'billing':
      return renderBillingView();
    case 'invoice':
      return renderInvoiceView();
    default:
      return renderMenuView();
  }
}

export default InvoiceManagementSubpage;
