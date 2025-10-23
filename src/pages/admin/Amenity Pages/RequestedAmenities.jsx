import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminHeader from '../components/AdminHeader';
import AddAmenityRequestModal from '../SubPages/AddAmenityRequestModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  Search,
  Eye,
  CheckCircle2,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>

function AdminRequestedAmenities() {
  const [amenityRequests, setAmenityRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  // New filters: date range and time sort order
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [timeSortOrder, setTimeSortOrder] = useState('desc'); // 'desc' (Latest → Oldest) | 'asc' (Oldest → Latest)
  const [notificationRefreshTrigger, setNotificationRefreshTrigger] = useState(0);
  // Grouping view state and modal
  const [groupView, setGroupView] = useState(true);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  

  // Add Amenity Request Modal States
  const [addAmenityModalOpen, setAddAmenityModalOpen] = useState(false);
  const [selectedBookingRoomFromNavigation, setSelectedBookingRoomFromNavigation] = useState(null);
  const [selectedBookingRoomsFromNavigation, setSelectedBookingRoomsFromNavigation] = useState([]);
  const [selectedAmenitiesFromNavigation, setSelectedAmenitiesFromNavigation] = useState([]);

  const location = useLocation();
  const APIConn = `${localStorage.url}admin.php`;

  // Datetime parsing helper for 'YYYY-MM-DD HH:mm:ss' and ISO strings
  const parseDateTime = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === 'string') {
      const normalized = val.includes('T') ? val : val.replace(' ', 'T');
      let d = new Date(normalized);
      if (!isNaN(d.getTime())) return d;
      const m = val.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (m) {
        const [_, y, mo, da, h, mi, s] = m;
        d = new Date(Number(y), Number(mo) - 1, Number(da), Number(h), Number(mi), Number(s || 0));
        return isNaN(d.getTime()) ? null : d;
      }
    }
    return null;
  };

  const fetchAmenityRequests = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'get_amenity_requests');
      
      const response = await axios.post(APIConn, formData);
      
      // Ensure we have an array and add default values for missing fields
      const requests = Array.isArray(response.data) ? response.data : [];
      const processedRequests = requests.map(request => ({
        ...request,
        request_status: request.request_status || 'pending',
        customer_name: request.customer_name || 'Unknown Customer',
        reference_no: request.reference_no || 'N/A',
        charges_master_name: request.charges_master_name || 'Unknown Amenity',
        roomtype_name: request.roomtype_name || 'Unknown Room',
        request_total: request.request_total || 0,
        request_price: request.request_price || 0,
        request_quantity: request.request_quantity || 1
      }));
      
      setAmenityRequests(processedRequests);
    } catch (error) {
      console.error('Error fetching amenity requests:', error);
      toast.error('Failed to fetch amenity requests');
      setAmenityRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [APIConn]);

  const fetchStats = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'get_amenity_request_stats');
      
      const response = await axios.post(APIConn, formData);
      
      // Ensure we have valid stats with default values
      const stats = response.data || {};
      setStats({
        total_requests: stats.total_requests || 0,
        pending_requests: stats.pending_requests || 0,
        approved_requests: stats.approved_requests || 0,
        rejected_requests: stats.rejected_requests || 0,
        pending_amount: stats.pending_amount || 0,
        approved_amount: stats.approved_amount || 0,
        current_month_approved: stats.current_month_approved || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        total_requests: 0,
        pending_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
        pending_amount: 0,
        approved_amount: 0,
        current_month_approved: 0
      });
    }
  }, [APIConn]);

  const handleAmenityRequestSuccess = () => {
    fetchAmenityRequests();
    fetchStats();
  };

  const filterRequests = useCallback(() => {
    let filtered = [...amenityRequests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.charges_master_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.request_status === statusFilter);
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => request.request_status === activeTab);
    }

    // Use shared parseDateTime defined at component scope
    const toDate = (val) => parseDateTime(val);

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days including today
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      filtered = filtered.filter((req) => {
        const dt = toDate(req.requested_at);
        if (!dt) return false;
        switch (dateRange) {
          case 'today':
            return dt >= startOfToday && dt <= endOfToday;
          case 'week':
            return dt >= startOfWeek && dt <= endOfToday;
          case 'month':
            return dt >= startOfMonth && dt <= endOfMonth;
          default:
            return true;
        }
      });
    }

    // Sort by requested_at (time) according to selected order
    filtered.sort((a, b) => {
      const da = toDate(a.requested_at);
      const db = toDate(b.requested_at);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return timeSortOrder === 'desc' ? tb - ta : ta - tb;
    });

    setFilteredRequests(filtered);
  }, [amenityRequests, searchTerm, statusFilter, activeTab, dateRange, timeSortOrder]);

  const handleAction = async (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes('');
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      const formData = new FormData();
      formData.append('method', actionType === 'approve' ? 'approve_amenity_request' : 'reject_amenity_request');
      formData.append('json', JSON.stringify({
        request_id: selectedRequest.request_id,
        employee_id: 1, // Default admin ID
        admin_notes: adminNotes
      }));

      const response = await axios.post(APIConn, formData);
      
      if (response.data === 1) {
        toast.success(`Amenity request ${actionType}d successfully!`);
        fetchAmenityRequests();
        fetchStats();
        setActionDialogOpen(false);
        // Trigger notification refresh
        setNotificationRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(`Failed to ${actionType} amenity request`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing amenity request:`, error);
      toast.error(`Failed to ${actionType} amenity request`);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined, null, or empty status
    if (!status || typeof status !== 'string') {
      status = 'pending'; // Default to pending
    }

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      mixed: { color: 'bg-gray-100 text-gray-800', icon: Package }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    // Parse MySQL DATETIME strings like "YYYY-MM-DD HH:mm:ss" reliably
    const normalized = typeof dateString === 'string' && !dateString.includes('T')
      ? dateString.replace(' ', 'T')
      : dateString;
    let d = new Date(normalized);

    if (isNaN(d.getTime())) {
      const m = typeof dateString === 'string'
        ? dateString.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
        : null;
      if (m) {
        const [_, y, mo, da, h, mi, s] = m;
        d = new Date(Number(y), Number(mo) - 1, Number(da), Number(h), Number(mi), Number(s || 0));
      }
    }

    if (isNaN(d.getTime())) return 'N/A';

    try {
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₱0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₱0.00';
    }
  };

  // useEffect calls
  useEffect(() => {
    fetchAmenityRequests();
    fetchStats();
  }, [fetchAmenityRequests, fetchStats]);

  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  // Group filtered requests by booking reference number (merged), track earliest and latest times
  const groupedRequests = useMemo(() => {
    if (!groupView) return [];
  
    const map = new Map();
    (filteredRequests || []).forEach((req) => {
      const ref = req.reference_no || 'N/A';
      const key = ref; // group by booking reference number only
      const dt = parseDateTime(req.requested_at);
  
      if (!map.has(key)) {
        map.set(key, {
          key,
          customer_name: req.customer_name,
          customer_email: req.customer_email,
          customer_phone: req.customer_phone,
          reference_no: ref,
          booking_id: req.booking_id,
          requested_at: req.requested_at,
          requests: [req],
          total_amount: Number(req.request_total) || 0,
          total_items: Number(req.request_quantity) || 0,
          status: req.request_status,
          status_mixed: false,
          earliest_requested_at: req.requested_at,
          latest_requested_at: req.requested_at
        });
      } else {
        const g = map.get(key);
        g.requests.push(req);
        g.total_amount += Number(req.request_total) || 0;
        g.total_items += Number(req.request_quantity) || 0;
        if (g.status !== req.request_status) g.status_mixed = true;
  
        const curEarliest = parseDateTime(g.earliest_requested_at);
        const curLatest = parseDateTime(g.latest_requested_at);
        const nxt = dt;
        if (!curEarliest || (nxt && nxt < curEarliest)) {
          g.earliest_requested_at = req.requested_at;
        }
        if (!curLatest || (nxt && nxt > curLatest)) {
          g.latest_requested_at = req.requested_at;
        }
      }
    });
  
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const da = parseDateTime(timeSortOrder === 'desc' ? a.latest_requested_at : a.earliest_requested_at);
      const db = parseDateTime(timeSortOrder === 'desc' ? b.latest_requested_at : b.earliest_requested_at);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return timeSortOrder === 'desc' ? tb - ta : ta - tb;
    });
  
    return arr;
  }, [filteredRequests, groupView, timeSortOrder]);

  // Handle navigation state from booking room selection and amenity selection
  useEffect(() => {
    if (location.state?.openAmenityModal) {
      // Handle multiple room selection (new)
      if (location.state?.selectedBookingRooms && location.state.selectedBookingRooms.length > 0) {
        setSelectedBookingRoomsFromNavigation(location.state.selectedBookingRooms);
        setSelectedBookingRoomFromNavigation(location.state.selectedBookingRooms[0]); // Set first room for backward compatibility
        console.log('🏨 Multiple rooms selected from navigation:', location.state.selectedBookingRooms);
      }
      // Handle single room selection (backward compatibility)
      else if (location.state?.selectedBookingRoom) {
        setSelectedBookingRoomFromNavigation(location.state.selectedBookingRoom);
        setSelectedBookingRoomsFromNavigation([location.state.selectedBookingRoom]);
        console.log('🏨 Single room selected from navigation:', location.state.selectedBookingRoom);
      }
      // Handle amenities selected from AmenitySelection
      if (location.state?.selectedAmenities && Array.isArray(location.state.selectedAmenities)) {
        setSelectedAmenitiesFromNavigation(location.state.selectedAmenities);
        console.log('📦 Amenities selected from navigation:', location.state.selectedAmenities);
      } else {
        setSelectedAmenitiesFromNavigation([]);
      }
      
      setAddAmenityModalOpen(true);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="lg:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113f67] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amenity requests...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader 
        notificationRefreshTrigger={notificationRefreshTrigger} 
        resetNotificationsOnPage={true}
      />
      <div className="lg:ml-72 p-4 space-y-6">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#113f67] mb-2">Amenity Requests Management</h1>
              <p className="text-gray-600">Review and manage customer amenity requests</p>
            </div>
            <Button 
              onClick={() => setAddAmenityModalOpen(true)}
              className="bg-[#113f67] hover:bg-[#0d2a4a] dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity Request
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-[#113f67]">{stats.total_requests || 0}</p>
                </div>
                <Package className="h-8 w-8 text-[#113f67]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending_requests || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved_requests || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Month Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.current_month_approved || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer, reference, amenity, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={timeSortOrder} onValueChange={setTimeSortOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Latest → Oldest</SelectItem>
                    <SelectItem value="asc">Oldest → Latest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Button variant="outline" onClick={() => setGroupView((v) => !v)} className="w-full">
                  {groupView ? 'Grouped View' : 'Ungrouped View'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({amenityRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending_requests || 0})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved_requests || 0})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected_requests || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Amenity Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No amenity requests found</p>
                    <p className="text-sm text-gray-400">
                      {amenityRequests.length === 0 
                        ? "No requests have been submitted yet. Make sure the database table 'tbl_customer_amenity_requests' has been created."
                        : "No requests match your current filters."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {groupView ? (
                            <>
                              <TableHead>Customer</TableHead>
                              <TableHead>Booking</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Requested</TableHead>
                              <TableHead>Actions</TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead>Customer</TableHead>
                              <TableHead>Booking</TableHead>
                              <TableHead>Room</TableHead>
                              <TableHead>Amenity</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Requested</TableHead>
                              <TableHead>Actions</TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupView ? (
                          groupedRequests.map((group) => (
                            <TableRow key={group.key}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{group.customer_name}</p>
                                  <p className="text-sm text-gray-500">{group.customer_email}</p>
                                  <p className="text-sm text-gray-500">{group.customer_phone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{group.reference_no}</p>
                                  <p className="text-sm text-gray-500">ID: {group.booking_id}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{group.requests.length} items</p>
                                  <p className="text-sm text-gray-500">Qty: {group.total_items}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{formatCurrency(group.total_amount)}</p>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(group.status_mixed ? 'mixed' : group.status)}
                              </TableCell>
                              <TableCell>
                                <p className="text-sm">{formatDate(timeSortOrder === 'desc' ? group.latest_requested_at : group.earliest_requested_at)}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => {
                                      setSelectedGroup(group);
                                      setGroupDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          filteredRequests.map((request) => (
                            <TableRow key={request.request_id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{request.customer_name}</p>
                                  <p className="text-sm text-gray-500">{request.customer_email}</p>
                                  <p className="text-sm text-gray-500">{request.customer_phone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{request.reference_no}</p>
                                  <p className="text-sm text-gray-500">ID: {request.booking_id}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{request.roomtype_name}</p>
                                  <p className="text-sm text-gray-500">Room: {request.roomnumber_name}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{request.charges_master_name}</p>
                                  <p className="text-sm text-gray-500">{request.charges_category_name}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{request.request_quantity}</Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{formatCurrency(request.request_total)}</p>
                                  <p className="text-sm text-gray-500">{formatCurrency(request.request_price)} each</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(request.request_status)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{formatDate(request.requested_at)}</p>
                                  {request.processed_at && (
                                    <p className="text-xs text-gray-500">
                                      Processed: {formatDate(request.processed_at)}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {request.request_status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleAction(request, 'approve')}
                                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleAction(request, 'reject')}
                                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setActionDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>
                {actionType ? `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Amenity Request` : 'Request Details'}
              </DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Request Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer</Label>
                    <p className="font-medium">{selectedRequest.customer_name}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.customer_email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Booking Reference</Label>
                    <p className="font-medium">{selectedRequest.reference_no}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Room</Label>
                    <p className="font-medium">{selectedRequest.roomtype_name}</p>
                    <p className="text-sm text-gray-500">Room: {selectedRequest.roomnumber_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Amenity</Label>
                    <p className="font-medium">{selectedRequest.charges_master_name}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.charges_category_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Quantity & Price</Label>
                    <p className="font-medium">{selectedRequest.request_quantity} × {formatCurrency(selectedRequest.request_price)}</p>
                    <p className="text-sm text-gray-500">Total: {formatCurrency(selectedRequest.request_total)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    {getStatusBadge(selectedRequest.request_status)}
                  </div>
        </div>

                {/* Customer Notes */}
                {selectedRequest.customer_notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer Notes</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.customer_notes}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedRequest.admin_notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Admin Notes</Label>
                    <p className="text-sm bg-blue-50 p-3 rounded">{selectedRequest.admin_notes}</p>
                  </div>
                )}

                {/* Action Form */}
                {actionType && selectedRequest.request_status === 'pending' && (
                  <div>
                    <Label htmlFor="adminNotes" className="text-sm font-medium text-gray-600">
                      Admin Notes {actionType === 'approve' ? '(Optional)' : '(Required)'}
                    </Label>
                    <Textarea
                      id="adminNotes"
                      placeholder={`Enter notes for ${actionType}ing this request...`}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setActionDialogOpen(false)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  {actionType && selectedRequest.request_status === 'pending' && (
                    <Button
                      onClick={confirmAction}
                      className={actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'}
                    >
                      {actionType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Group View Modal (custom, no Dialog) */}
        {groupDialogOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setGroupDialogOpen(false)}
            />

            {/* Modal container */}
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
              <div className="relative w-[98vw] sm:max-w-[98vw] max-h-[95vh] overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-lg shadow-lg">
                {/* Modal header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Group Details</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setGroupDialogOpen(false)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Close
                  </Button>
                </div>

                {/* Modal content */}
                {selectedGroup && (
                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</Label>
                        <p className="font-bold text-gray-900 dark:text-white">{selectedGroup.customer_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedGroup.customer_email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Booking Reference</Label>
                        <p className="font-bold text-gray-900 dark:text-white">{selectedGroup.reference_no}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">ID: {selectedGroup.booking_id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested</Label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(timeSortOrder === 'desc' ? selectedGroup.latest_requested_at : selectedGroup.earliest_requested_at)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Totals</Label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Items: {selectedGroup.requests.length} / Qty: {selectedGroup.total_items}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Amount: {formatCurrency(selectedGroup.total_amount)}</p>
                      </div>
                    </div>

                    

                    <div className="overflow-x-auto overflow-y-auto max-h-[50vh]">
                      <Table className="text-gray-900 dark:text-white">
                        <TableHeader className="sticky top-0 z-20 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                          <TableRow>
                            <TableHead className="text-gray-700 dark:text-gray-300">Amenity</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">Room</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">Date & Time Requested</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">Quantity</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(
                            (selectedGroup?.requests || [])
                              .slice()
                              .sort((a, b) => {
                                const normA = typeof a.requested_at === 'string' && !a.requested_at.includes('T') ? a.requested_at.replace(' ', 'T') : a.requested_at;
                                const normB = typeof b.requested_at === 'string' && !b.requested_at.includes('T') ? b.requested_at.replace(' ', 'T') : b.requested_at;
                                const da = normA ? new Date(normA) : new Date(0);
                                const db = normB ? new Date(normB) : new Date(0);
                                const ta = isNaN(da.getTime()) ? 0 : da.getTime();
                                const tb = isNaN(db.getTime()) ? 0 : db.getTime();
                                return timeSortOrder === 'desc' ? tb - ta : ta - tb;
                              })
                          ).map((req) => (
                            <TableRow key={req.request_id}>
                              <TableCell className="text-gray-900 dark:text-white">
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">{req.charges_master_name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{req.charges_category_name}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-white">
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">{req.roomtype_name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">Room: {req.roomnumber_name}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-white">{formatDate(req.requested_at)}</TableCell>
                              <TableCell className="text-gray-900 dark:text-white"><Badge variant="outline">{req.request_quantity}</Badge></TableCell>
                              <TableCell className="text-gray-900 dark:text-white">{formatCurrency(req.request_price)}</TableCell>
                              <TableCell className="text-gray-900 dark:text-white">{formatCurrency(req.request_total)}</TableCell>
                            </TableRow>
                          ))}
                          {/* Separator + Total row */}
                          <TableRow>
                            <TableCell colSpan={6} className="p-0">
                              <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-right font-bold text-gray-900 dark:text-white" colSpan={5}>Total Amount</TableCell>
                            <TableCell className="font-bold text-gray-900 dark:text-white">{formatCurrency((selectedGroup?.requests || []).reduce((sum, req) => sum + (Number(req.request_total) || 0), 0))}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setGroupDialogOpen(false)}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Add Amenity Request Modal */}
        <AddAmenityRequestModal
          isOpen={addAmenityModalOpen}
          onClose={() => setAddAmenityModalOpen(false)}
          onSuccess={handleAmenityRequestSuccess}
          notificationRefreshTrigger={notificationRefreshTrigger}
          setNotificationRefreshTrigger={setNotificationRefreshTrigger}
          selectedBookingRoomFromNavigation={selectedBookingRoomFromNavigation}
          selectedBookingRoomsFromNavigation={selectedBookingRoomsFromNavigation}
          selectedAmenitiesFromNavigation={selectedAmenitiesFromNavigation}
        />
      </div>
      </div>
    </>
  );
}

export default AdminRequestedAmenities;