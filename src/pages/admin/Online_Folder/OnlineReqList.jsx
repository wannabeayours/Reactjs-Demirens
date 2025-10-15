// src/admin/OnlineReqList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { flushSync } from "react-dom";
import AdminHeader from "../components/AdminHeader";
import { useApproval } from "./ApprovalContext";
import { DateFormatter } from '../Function_Files/DateFormatter';
import { NumberFormatter } from '../Function_Files/NumberFormatter';
import DataTable from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OnlineReqList() {
  const APIConn = `${localStorage.url}admin.php`;
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setState } = useApproval();

  // New filter states
  const [dateFrom, setDateFrom] = useState(""); // yyyy-MM-dd
  const [dateTo, setDateTo] = useState("");   // yyyy-MM-dd
  const [createdSortOrder, setCreatedSortOrder] = useState("asc"); // 'asc' (Oldest → Newest) | 'desc' (Newest → Oldest)

  useEffect(() => {
    // Prefill search from navigation state or URL query param
    const statePrefill = location.state?.prefillSearch;
    const urlParams = new URLSearchParams(location.search);
    const queryPrefill = urlParams.get('q');
    const prefill = statePrefill || queryPrefill;
    if (prefill) {
      setSearchTerm(prefill);
      // Clear navigation state to avoid stale auto-open on subsequent visits
      if (statePrefill) {
        navigate(location.pathname + location.search, { replace: true });
      }
    }
  }, [location, navigate]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("method", "reqBookingList");
      const res = await axios.post(APIConn, formData);
      const data = res?.data;
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        // Handle API message or error response
        setBookings([]);
        console.warn("reqBookingList returned non-array:", data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBookings();
  }, []);

  // Helpers
  const safeStr = (v) => (typeof v === 'string' ? v : v?.toString?.() || "");
  const normalizeDate = (str) => (str ? str.replace(' ', 'T') : "");
  const onlyDate = (str) => (str ? safeStr(str).slice(0, 10) : "");
  const toDate = (str) => {
    if (!str) return null;
    const d = new Date(normalizeDate(str));
    return isNaN(d.getTime()) ? null : d;
  };
  const diffNights = (inStr, outStr) => {
    try {
      const a = new Date(normalizeDate(inStr));
      const b = new Date(normalizeDate(outStr));
      const ms = b - a;
      const nights = Math.round(ms / (1000 * 60 * 60 * 24));
      return Math.max(1, nights || 0);
    } catch {
      return 0;
    }
  };
  const summarizeRequested = (rooms) => {
    const arr = Array.isArray(rooms) ? rooms : [];
    const map = new Map();
    for (const r of arr) {
      const name = (r?.roomtype_name || "").trim();
      if (!name) continue;
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  };

  // Apply search and date-range filters (booking dates)
  const filtered = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return (Array.isArray(bookings) ? bookings : []).filter((b) => {
      if (!b) return false;

      // Search by reference number or customer name
      const ref = (b.reference_no || b.referenceNo || '').toLowerCase();
      const name = (
        b.customer_name || [b.first_name, b.last_name].filter(Boolean).join(' ')
      ).toLowerCase();
      const matchesSearch = !q || ref.includes(q) || name.includes(q);
      if (!matchesSearch) return false;

      // Date range based on check-in date
      const checkInStr = b.booking_checkin_dateandtime || b.checkin_date || '';
      const checkIn = toDate(checkInStr);
      if ((from && (!checkIn || checkIn < from)) || (to && (!checkIn || checkIn > to))) {
        return false;
      }

      return true;
    });
  }, [bookings, searchTerm, dateFrom, dateTo]);

  // Define openApproval earlier so it can be safely referenced in columns
  const openApproval = (b) => {
    const rooms = Array.isArray(b?.rooms) ? b.rooms : [];
    const summary = summarizeRequested(rooms);

    const checkIn = b?.booking_checkin_dateandtime || b?.checkin_date;
    const checkOut = b?.booking_checkout_dateandtime || b?.checkout_date;
    const nights = diffNights(checkIn, checkOut);

    const bookingId = b?.booking_id || b?.bookingId;
    if (!bookingId) {
      console.warn("Cannot open approval: missing bookingId", b);
      return;
    }

    const keys = ["admin_id", "user_id", "userId", "userID", "employee_id", "employeeId"];
    let adminId = null;
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) { adminId = v; break; }
    }

    flushSync(() => {
      setState((prev) => ({
        ...prev,
        bookingId: bookingId,
        userId: adminId,
        customerName: b.customer_name || `${b.customers_lastname || ''}, ${b.customers_firstname || ''}`.trim(),
        checkIn: onlyDate(checkIn),
        checkOut: onlyDate(checkOut),
        nights,
        requestedRoomTypes: summary.map((s) => ({ name: s.name })),
        requestedRoomCount: rooms.length,
        selectedRooms: [],
      }));
    });

    navigate(`/admin/receipt/${bookingId}`);
  };

  // Contact view handler
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', name: '' });
  const viewContact = (b) => {
    const phone = b?.customers_online_phone || b?.customers_phone || b?.phone_number || b?.phone || b?.contact_number || b?.customer_phone || 'No phone on file';
    const email = b?.customers_online_email || b?.customers_email || b?.email || b?.customer_email || 'No email on file';
    const name = b?.customer_name || [b?.first_name, b?.last_name].filter(Boolean).join(' ') || '';
    setContactInfo({ phone, email, name });
    setContactModalOpen(true);
  };

  // Columns for DataTable (disable column-click sorting)
  const columns = useMemo(() => [
    {
      header: 'Reference',
      accessor: (row) => row?.reference_no || row?.referenceNo || 'Unknown Ref',
      sortable: false,
      headerClassName: 'min-w-[140px]'
    },
    {
      header: 'Customer',
      accessor: (row) => row?.customer_name || [row?.first_name, row?.last_name].filter(Boolean).join(' ') || 'Unknown Customer',
      sortable: false,
    },
    {
      header: 'Dates',
      accessor: (row) => {
        const checkIn = row?.booking_checkin_dateandtime || row?.checkin_date;
        const checkOut = row?.booking_checkout_dateandtime || row?.checkout_date;
        return DateFormatter.formatDateRange(checkIn, checkOut);
      },
      sortable: false,
    },
    {
      header: 'Created',
      accessor: (row) => {
        const createdAt = row?.booking_created_at || row?.created_at || row?.booking_createdAt;
        const normalized = createdAt ? createdAt.toString().replace(' ', 'T') : '';
        const d = new Date(normalized);
        const t = d.getTime();
        return Number.isNaN(t) ? 0 : t;
      },
      cell: (row) => {
        const createdAt = row?.booking_created_at || row?.created_at || row?.booking_createdAt;
        return DateFormatter.formatDate(createdAt);
      },
      sortable: false,
      headerClassName: 'min-w-[200px]'
    },
    // Removed Nights column
    // Removed Guests column
    {
      header: 'Requested',
      accessor: (row) => summarizeRequested(row?.rooms).map(s => `${s.name}×${s.count}`).join(', '),
      cell: (row) => {
        const requested = summarizeRequested(row?.rooms);
        return (
          <div className="flex flex-wrap gap-2">
            {requested.map((r, i) => (
              <Badge key={i} variant="secondary" className="bg-muted text-muted-foreground">
                {r.name} × {r.count}
              </Badge>
            ))}
          </div>
        );
      },
      sortable: false,
    },
    {
      header: 'Actions',
      accessor: 'action',
      cell: (row) => (
        <div className="flex gap-2 justify-end">
          <Button onClick={(e) => { e.stopPropagation(); viewContact(row); }} variant="outline">
            View
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); openApproval(row); }} variant="default">
            Approve
          </Button>
        </div>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
      sortable: false,
    }
  ], [openApproval]);

  // Sort by booking_created_at according to filter (Oldest → Newest or Newest → Oldest)
  const finalData = useMemo(() => {
    const toCreatedTime = (b) => {
      const createdAt = b?.booking_created_at || b?.created_at || b?.booking_createdAt || '';
      const d = new Date(normalizeDate(createdAt));
      const t = d.getTime();
      return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
    };
    const base = [...filtered];
    base.sort((a, b) => {
      const diff = toCreatedTime(a) - toCreatedTime(b);
      return createdSortOrder === 'asc' ? diff : -diff;
    });
    return base;
  }, [filtered, createdSortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setCreatedSortOrder("asc");
  };

  return (
    <>
      <AdminHeader />
      <div className="lg:ml-72 p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-foreground text-center">Online Booking Requests</h1>
        {isLoading && (
          <div className="text-sm text-muted-foreground mb-2">Loading pending requests…</div>
        )}

        {/* Filter Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search (Reference No or Customer) */}
              <div>
                <Label>Search</Label>
                <Input
                  type="text"
                  placeholder="Search by Reference No. or Customer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background text-foreground"
                />
              </div>

              {/* Date From */}
              <div>
                <Label>From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-background text-foreground"
                />
              </div>

              {/* Date To */}
              <div>
                <Label>To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-background text-foreground"
                />
              </div>

              {/* Created Sort Order */}
              <div>
                <Label>Created Date Sort</Label>
                <Select value={createdSortOrder} onValueChange={setCreatedSortOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Oldest to Newest</SelectItem>
                    <SelectItem value="desc">Newest to Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={finalData}
          itemsPerPage={10}
          onRowClick={(row) => openApproval(row)}
          tableCaption="Click a row or Approve to proceed"
          headerClassName="bg-card text-card-foreground rounded-md border border-border"
          hideSearch={true}
        />
      </div>
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {contactInfo.name && (
              <div>
                <div className="text-muted-foreground">Customer</div>
                <div className="font-medium text-foreground">{contactInfo.name}</div>
              </div>
            )}
            <div>
              <div className="text-muted-foreground">Phone</div>
              <div className="font-medium text-foreground">{contactInfo.phone || 'No phone on file'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium text-foreground">{contactInfo.email || 'No email on file'}</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setContactModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}