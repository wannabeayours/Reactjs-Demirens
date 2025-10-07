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
import { FileText, Plus, CheckCircle, AlertCircle, Calculator, Receipt, CreditCard, DollarSign, Eye, X } from "lucide-react";

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
    vat_rate: 0.12,
    downpayment: 0,
    invoice_status_id: 1
  });

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
        employee_id: 1
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
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
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

  const confirmCreateInvoice = async () => {
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }

    // If no billing_id, try to create one first
    if (!selectedBooking.billing_id) {
      const billingCreated = await createBillingRecord(selectedBooking.booking_id);
      if (!billingCreated) {
        toast.error("Failed to create billing record");
        return;
      }
      toast.info("Billing record created. Please try creating invoice again.");
      return;
    }

    try {
      setLoading(true);

      const jsonData = {
        billing_ids: [selectedBooking.billing_id],
        employee_id: 1, // Replace with session value
        payment_method_id: invoiceForm.payment_method_id,
        invoice_status_id: invoiceForm.invoice_status_id,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      };

      console.log("Creating invoice with data:", jsonData);

      const formData = new FormData();
      formData.append("operation", "createInvoice");
      formData.append("json", JSON.stringify(jsonData));

      const url = localStorage.getItem("url") + "transactions.php";
      const res = await axios.post(url, formData);

      console.log("Invoice creation response:", res.data);

      if (res.data?.success) {
        toast.success(res.data.message || "Invoice created successfully!");
        onInvoiceCreated(); // Call parent callback to refresh data
        onClose(); // Close the management subpage
      } else {
        toast.error(res.data.message || "Failed to create invoice.");
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error("An error occurred while creating the invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
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
        </div>

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
                      <TableCell className="text-right font-mono">₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-center">{charge.quantity}</TableCell>
                      <TableCell className="text-right font-mono font-bold">₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}</TableCell>
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
                  Current Total: ₱{bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0).toFixed(2)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Room Charges:</span>
                      <span className="font-mono font-semibold">₱{(parseFloat(billingBreakdown.room_total) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Additional Charges:</span>
                      <span className="font-mono font-semibold">₱{(parseFloat(billingBreakdown.charge_total) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-mono font-semibold">₱{(parseFloat(billingBreakdown.subtotal) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Discount:</span>
                      <span className="font-mono font-semibold text-red-600">-₱{(parseFloat(billingBreakdown.discount_amount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Amount After Discount:</span>
                      <span className="font-mono font-semibold">₱{(parseFloat(billingBreakdown.amount_after_discount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">VAT ({((parseFloat(invoiceForm.vat_rate) || 0) * 100).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">₱{(parseFloat(billingBreakdown.vat_amount) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 bg-muted rounded-lg px-4">
                    <span className="font-bold text-xl">Final Total:</span>
                    <span className="font-mono font-bold text-xl">₱{(parseFloat(billingBreakdown.final_total) || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="font-medium">Downpayment:</span>
                      <span className="font-mono font-semibold">₱{(parseFloat(billingBreakdown.downpayment) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 border border-yellow-200 dark:border-yellow-800">
                      <span className="font-bold text-lg">Balance Due:</span>
                      <span className="font-mono font-bold text-lg text-yellow-800 dark:text-yellow-200">₱{(parseFloat(billingBreakdown.balance) || 0).toFixed(2)}</span>
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
                                  <TableHead className="text-center">Quantity</TableHead>
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
                                    <TableCell className="text-right font-mono">₱{(parseFloat(room.unit_price) || 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{room.quantity}</TableCell>
                                    <TableCell className="text-right font-bold font-mono">
                                      ₱{(parseFloat(room.total_amount) || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{room.charges_master_description || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-right">
                            <span className="font-bold text-lg">
                              🏨 Room Total: ₱{detailedCharges.summary.room_total.toFixed(2)}
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
                                    <TableCell className="text-right font-mono">₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{charge.quantity}</TableCell>
                                    <TableCell className="text-right font-bold font-mono">
                                      ₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{charge.charges_master_description || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-right">
                            <span className="font-bold text-lg">
                              🛍️ Additional Total: ₱{detailedCharges.summary.charges_total.toFixed(2)}
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
                                <span>₱{detailedCharges.summary.room_total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Additional Charges:</span>
                                <span>₱{detailedCharges.summary.charges_total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Subtotal:</span>
                                <span>₱{detailedCharges.summary.subtotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h6 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Tax & Payment</h6>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>VAT ({(detailedCharges.summary.vat_rate * 100).toFixed(0)}%):</span>
                                <span>₱{detailedCharges.summary.vat_amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Downpayment:</span>
                                <span className="text-green-600">-₱{detailedCharges.summary.downpayment.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-1 text-lg">
                                <span>Balance Due:</span>
                                <span className="text-red-600">₱{detailedCharges.summary.balance.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Grand Total */}
                        <div className="p-5 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                          <span className="font-bold text-xl">
                            💰 GRAND TOTAL: ₱{detailedCharges.summary.grand_total.toFixed(2)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  value={invoiceForm.payment_method_id.toString()} 
                  onValueChange={(value) => setInvoiceForm({...invoiceForm, payment_method_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">GCash</SelectItem>
                    <SelectItem value="2">Cash</SelectItem>
                    <SelectItem value="3">Paymaya</SelectItem>
                    <SelectItem value="4">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vat_rate">VAT Rate</Label>
                <Input
                  id="vat_rate"
                  type="text"
                  value={invoiceForm.vat_rate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setInvoiceForm({...invoiceForm, vat_rate: parseFloat(value) || 0});
                    }
                  }}
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0.12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="downpayment">Downpayment</Label>
                <Input
                  id="downpayment"
                  type="text"
                  value={invoiceForm.downpayment}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setInvoiceForm({...invoiceForm, downpayment: parseFloat(value) || 0});
                    }
                  }}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-6">
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
            </div>
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
