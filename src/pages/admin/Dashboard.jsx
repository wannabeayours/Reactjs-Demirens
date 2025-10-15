import React, { useState, useEffect, useMemo } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios';
import { NumberFormatter } from './Function_Files/NumberFormatter'
import { DateFormatter } from './Function_Files/DateFormatter'

// ShadCN UI
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, Calendar, DollarSign as DollarSignIcon, User, Building, X, AlertTriangle } from "lucide-react"
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const APIConn = `${localStorage.url}admin.php`;
  // Respect existing role; do not override it here.

  const navigate = useNavigate();
  const [resvData, setResvData] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [detailedBookingData, setDetailedBookingData] = useState([])
  const [showDetailedModal, setShowDetailedModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [activeBookings, setActiveBookings] = useState({})
  const [availableRooms, setAvailableRooms] = useState({})
  const [roomStatusCounts, setRoomStatusCounts] = useState({})
  const [availableByRoomType, setAvailableByRoomType] = useState({})
  const [roomTypeStatusCounts, setRoomTypeStatusCounts] = useState({})
  const [showAvailableTypesModal, setShowAvailableTypesModal] = useState(false)
  // New: Most booked rooms state
  const [mostBookedScope, setMostBookedScope] = useState('month')
  const [mostBookedData, setMostBookedData] = useState([])
  const statusColorMap = {
    Occupied: '#ef4444', // red-500
    Pending: '#f59e0b',  // amber-500
    Vacant: '#22c55e',   // green-500
    'Under-Maintenance': '#64748b', // slate-500
    Dirty: '#a855f7',    // purple-500
  }
  // New: online pending booking requests count
  const [onlinePendingCount, setOnlinePendingCount] = useState(0)
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0)
  // Fetch count of pending online booking requests
  const fetchOnlinePendingCount = async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'reqBookingList');
      const res = await axios.post(APIConn, formData);
      const list = Array.isArray(res.data) ? res.data : [];
      setOnlinePendingCount(list.length);
    } catch (error) {
      console.error('Failed to fetch online pending booking requests:', error);
      setOnlinePendingCount(0);
    }
  }
  // Distinct color palette for Most Booked Rooms slices
  const mostBookedColors = [
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#22c55e', // green-500
    '#f59e0b', // amber-500
    '#a855f7', // purple-500
    '#06b6d4', // cyan-500
    '#f43f5e', // rose-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#4b5563', // gray-600
  ]

  // Dynamic greeting and derived metrics for quick stats
  const storedType = (localStorage.getItem('userType') || '').toLowerCase().replace(/[\s_-]/g, '');
  const storedLevel = (localStorage.getItem('userLevel') || '').toLowerCase().replace(/[\s_-]/g, '');
  const normalizedRole = storedLevel || storedType; // prefer userLevel, fallback to userType
  const roleLabel = normalizedRole === 'frontdesk' ? 'Front Desk' : 'Admin';
  const hours = new Date().getHours();
  const timeGreeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  const totalRooms = useMemo(() => Object.values(roomStatusCounts).reduce((sum, c) => sum + c, 0), [roomStatusCounts]);
  const vacantCount = useMemo(() => (roomStatusCounts['Vacant'] || roomStatusCounts['vacant'] || 0), [roomStatusCounts]);
  const occupiedCount = useMemo(() => (roomStatusCounts['Occupied'] || roomStatusCounts['occupied'] || 0), [roomStatusCounts]);
  const pendingCount = useMemo(() => (roomStatusCounts['Pending'] || roomStatusCounts['pending'] || 0), [roomStatusCounts]);
  const occupancyRate = useMemo(() => totalRooms ? Math.round((occupiedCount / totalRooms) * 100) : 0, [occupiedCount, totalRooms]);
  const availableRoomsCount = useMemo(() => Object.values(availableByRoomType).reduce((sum, c) => sum + c, 0), [availableByRoomType]);

  // Pie chart data for Room Status Distribution
  const pieData = useMemo(() => {
    const entries = Object.entries(roomStatusCounts);
    return entries
      .map(([status, count]) => ({
        name: status,
        value: count,
        color: statusColorMap[status] || '#94a3b8',
      }))
      .filter(item => item.value > 0);
  }, [roomStatusCounts]);
  // New: memoized pie data for most booked rooms chart
  const mostBookedPieData = useMemo(() => {
    return (mostBookedData || []).map((item, idx) => ({
      name: item.roomtype_name,
      value: Number(item.bookings_count) || 0,
      color: mostBookedColors[idx % mostBookedColors.length],
    })).filter(d => d.value > 0)
  }, [mostBookedData])
  const runAutoCheckout = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "autoCheckoutAndSeedBillings");
      await axios.post(APIConn, formData);
    } catch (err) {
      console.error("Auto checkout and billing seed failed", err);
    }
  };

  const yTicks = useMemo(() => {
    const min = 80000;
    const maxData = Math.max(min, ...resvData.map(d => (typeof d.sales === 'number' ? d.sales : 0)));
    const stepRaw = Math.ceil((maxData - min) / 6);
    const niceStep = Math.max(1000, Math.ceil(stepRaw / 1000) * 1000);
    return Array.from({ length: 7 }, (_, i) => min + i * niceStep);
  }, [resvData]);

  const gatherBooking = async (yearToFilter = new Date().getFullYear()) => {
    try {
      const formData = new FormData();
      formData.append("method", "getInvoiceDatas");

      const res = await axios.post(APIConn, formData);
      if (res.data && Array.isArray(res.data)) {
        // Extract unique years from invoice data
        const uniqueYears = [...new Set(res.data.map(invoice => {
          const date = new Date(invoice.invoice_date);
          return date.getFullYear();
        }))].sort((a, b) => b - a); // Sort in descending order (newest first)
        
        setAvailableYears(uniqueYears);

        const monthMap = {
          January: 0, February: 0, March: 0, April: 0,
          May: 0, June: 0, July: 0, August: 0,
          September: 0, October: 0, November: 0, December: 0,
        };

        const monthTotalMap = { ...monthMap };

        res.data.forEach((invoice) => {
          const date = new Date(invoice.invoice_date);
          const year = date.getFullYear();
          const monthIndex = date.getMonth();

          if (year === yearToFilter) {
            const monthName = Object.keys(monthMap)[monthIndex];
            if (monthName) {
              monthMap[monthName] += 1;
              monthTotalMap[monthName] += parseFloat(invoice.total_invoice) || 0;
            }
          }
        });

        const chartReadyData = Object.entries(monthMap).map(([month]) => ({
          month,
          sales: monthTotalMap[month],
        }));

        setResvData(chartReadyData);
      } else {
        setResvData([]);
        setAvailableYears([]);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const fetchDetailedBookingDataByMonth = async (month, year) => {
    try {
      const formData = new FormData();
      formData.append("method", "getDetailedBookingSalesByMonth");
      formData.append("month", month);
      formData.append("year", year);

      const res = await axios.post(APIConn, formData);
      if (res.data && Array.isArray(res.data)) {
        setDetailedBookingData(res.data);
      } else {
        setDetailedBookingData([]);
      }
    } catch (error) {
      toast.error("Failed to fetch detailed booking data");
      console.error(error);
    }
  };

  const fetchActiveBookings = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "viewBookingsCheckedInEnhanced");

      const res = await axios.post(APIConn, formData);
      
      if (res.data && !res.data.error) {
        const count = Array.isArray(res.data) ? res.data.length : (res.data.active_bookings_count ?? 0);
        setActiveBookings({ active_bookings_count: count });
      } else {
        setActiveBookings({ active_bookings_count: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch active bookings:", error);
      setActiveBookings({ active_bookings_count: 0 });
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "getAvailableRoomsCount");

      const res = await axios.post(APIConn, formData);
      
      if (res.data && !res.data.error) {
        setAvailableRooms(res.data);
      } else {
        setAvailableRooms({});
      }
    } catch (error) {
      console.error("Failed to fetch available rooms:", error);
      setAvailableRooms({});
    }
  };

  const fetchRoomStatusDistribution = async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'viewAllRooms');

      const res = await axios.post(APIConn, formData);
      if (Array.isArray(res.data)) {
        const counts = {};
        const availableByType = {};
        const typeStatusCounts = {};
        const normalizeStatus = (s) => {
          const t = String(s || 'Unknown').trim().toLowerCase();
          switch (t) {
            case 'occupied': return 'Occupied';
            case 'pending': return 'Pending';
            case 'vacant': return 'Vacant';
            case 'under-maintenance': return 'Under-Maintenance';
            case 'dirty': return 'Dirty';
            default: return String(s || 'Unknown').trim();
          }
        };
        res.data.forEach((room) => {
          const status = normalizeStatus(room.status_name);
          const typeName = String(room.roomtype_name || 'Unknown').trim();
          // Global status distribution (normalized)
          counts[status] = (counts[status] || 0) + 1;
          // Available by room type (Vacant only)
          if (status.toLowerCase() === 'vacant') {
            availableByType[typeName] = (availableByType[typeName] || 0) + 1;
          }
          // Per room type status counts
          if (!typeStatusCounts[typeName]) typeStatusCounts[typeName] = {};
          typeStatusCounts[typeName][status] = (typeStatusCounts[typeName][status] || 0) + 1;
        });
        setRoomStatusCounts(counts);
        setAvailableByRoomType(availableByType);
        setRoomTypeStatusCounts(typeStatusCounts);
      } else {
        setRoomStatusCounts({});
        setAvailableByRoomType({});
        setRoomTypeStatusCounts({});
      }
    } catch (error) {
      console.error('Failed to fetch room status distribution:', error);
      setRoomStatusCounts({});
      setAvailableByRoomType({});
      setRoomTypeStatusCounts({});
    }
  };

  const handleBarClick = (data) => {
    if (data && data.month) {
      setSelectedMonth(data.month);
      fetchDetailedBookingDataByMonth(data.month, selectedYear);
      setShowDetailedModal(true);
    }
  };

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "var(--chart-1)",
    },
  }

  const fetchPendingBookings = async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'viewBookingsPendingEnhanced');
      const res = await axios.post(APIConn, formData);
      if (Array.isArray(res.data)) {
        setPendingBookingsCount(res.data.length);
      } else if (res.data && typeof res.data.pending_count === 'number') {
        setPendingBookingsCount(res.data.pending_count);
      } else {
        setPendingBookingsCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch pending bookings:', error);
      setPendingBookingsCount(0);
    }
  }

  useEffect(() => {
    gatherBooking(selectedYear);
    fetchActiveBookings();
    fetchAvailableRooms();
    fetchRoomStatusDistribution();
    fetchOnlinePendingCount();
    fetchPendingBookings();
    // New: fetch most booked rooms
    const fetchMostBookedRooms = async (scope) => {
      try {
        const formData = new FormData();
        formData.append('method', 'getMostBookedRooms');
        formData.append('scope', scope || mostBookedScope);
        const res = await axios.post(APIConn, formData);
        if (Array.isArray(res.data)) {
          setMostBookedData(res.data);
        } else {
          setMostBookedData([]);
        }
      } catch (error) {
        console.error('Failed to fetch most booked rooms:', error);
        setMostBookedData([]);
      }
    }

    // Fetch immediately on mount and whenever scope/year changes
    fetchMostBookedRooms(mostBookedScope);
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchActiveBookings();
      fetchAvailableRooms();
      fetchRoomStatusDistribution();
      fetchMostBookedRooms(mostBookedScope);
      fetchOnlinePendingCount();
      fetchPendingBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedYear, mostBookedScope]);

  // Update selectedYear when availableYears are loaded and current selectedYear is not in the list
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]); // Set to the most recent year
    }
  }, [availableYears, selectedYear]);

  return (
    <>
      <div>
        <AdminHeader />

        <div className="ml-0 lg:ml-72 p-4 space-y-6 text-gray-900 dark:text-white">
          {/* Welcome Section - simple centered text, not inside a card */}
          <div className="py-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{timeGreeting}, {roleLabel}!</h2>
            <p className="mt-1 text-gray-700 dark:text-gray-300">Welcome to the Demiren Hotel Dashboard. Here's your live overview.</p>
          </div>

          {/* Quick Stats Section */}
          <section>
            <label htmlFor="CardGroup" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
              Quick Stats
            </label>

            {/* Alert: Pending Online Requests */}
            {onlinePendingCount > 0 && (
              <div className="mb-3 flex justify-end">
                <button
                  onClick={() => navigate('/admin/online')}
                  className="animate-pulse inline-flex items-center gap-2 px-3 py-1 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-100 shadow-sm"
                  aria-label="Go to Online Booking Requests"
                  title="Pending Online Booking Requests"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {NumberFormatter.formatCount(onlinePendingCount)} Pending Online Booking {onlinePendingCount > 1 ? 'Requests' : 'Request'}
                  </span>
                </button>
              </div>
            )}

            {/* Compact single-row layout */}
            <div id="CardGroup" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Active Bookings Card */}
              <div className="w-full">
                <Card className="min-h-[120px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Active Bookings
                      </CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">Live</Badge>
                    </div>
                    <CardDescription className="text-blue-700 dark:text-blue-300">Current guests in hotel</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                        {NumberFormatter.formatCount(activeBookings.active_bookings_count || 0)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Active Bookings</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Available Rooms Card */}
              <div className="w-full">
                <Card className="min-h-[120px] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Available Rooms
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Live</Badge>
                    </div>
                    <CardDescription className="text-green-700 dark:text-green-300">Vacant rooms across all types</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                        {NumberFormatter.formatCount(availableRoomsCount || 0)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">Total Vacant</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full flex justify-center">
                      <Button variant="outline" size="sm" onClick={() => setShowAvailableTypesModal(true)}>
                        View by Room Type
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Pending Bookings Card */}
              <div className="w-full">
                <Card className="min-h-[120px] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Pending Bookings
                      </CardTitle>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">Live</Badge>
                    </div>
                    <CardDescription className="text-amber-700 dark:text-amber-300">Awaiting approval/check-in</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                        {NumberFormatter.formatCount(pendingBookingsCount || 0)}
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-400">Pending Bookings</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </section>

          {/* Charts Row: Room Status Distribution and Most Booked Rooms */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Room Status Distribution */}
            <Card className="min-h-[300px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Room Status Distribution
                  </CardTitle>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">Live</Badge>
                </div>
                <CardDescription className="text-indigo-700 dark:text-indigo-300">Segmented Status from Each Rooms</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {pieData.length > 0 ? (
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="w-full h-[220px] flex items-center justify-center">
                    <div className="w-full h-full bg-indigo-100 dark:bg-indigo-800/30 rounded-md" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Booked Rooms Pie */}
            <Card className="min-h-[300px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Most Booked Rooms</CardTitle>
                  <div className="w-[160px]">
                    <Select value={mostBookedScope} onValueChange={(value) => setMostBookedScope(value)}>
                      <SelectTrigger className="w-full text-gray-900 dark:text-white">
                        <SelectValue placeholder="Scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-700 dark:text-gray-300">Top room types by bookings</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {mostBookedPieData.length > 0 ? (
                  <div className="w-full h-[220px] flex items-center gap-4">
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mostBookedPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            paddingAngle={2}
                          >
                            {mostBookedPieData.map((entry, index) => (
                              <Cell key={`mb-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-48 h-full overflow-auto border rounded-md border-slate-200 dark:border-slate-700 p-2">
                      <ul className="space-y-2">
                        {mostBookedPieData.map((entry, idx) => (
                          <li key={`mb-legend-${idx}`} className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="truncate max-w-[7rem]">{entry.name}</span>
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[220px] flex items-center justify-center">
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800/30 rounded-md" />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Room Types Status Cards */}
          <div className="w-full">
            <Card className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Room Types Overview</CardTitle>
                <CardDescription className="text-sm text-gray-700 dark:text-gray-300">Per-type room counts by current status</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const entries = Object.entries(roomTypeStatusCounts);
                  if (entries.length === 0) {
                    return (
                      <div className="text-center text-sm text-muted-foreground">No room type data available</div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entries.map(([typeName, statusCounts]) => {
                        const total = Object.values(statusCounts).reduce((sum, c) => sum + c, 0);
                        return (
                          <Card key={typeName} className="border">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base text-gray-900 dark:text-white">{typeName}</CardTitle>
                                <Badge variant="secondary" className="text-xs">Total of {total} rooms</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                  <div key={status} className="flex items-center gap-2 px-2 py-1 rounded border text-xs">
                                    <span
                                      className="inline-block h-3 w-3 rounded"
                                      style={{ backgroundColor: statusColorMap[status] || '#94a3b8' }}
                                      title={status}
                                    />
                                    <span className="text-slate-800 dark:text-slate-200">{status}</span>
                                    <span className="text-slate-500 dark:text-slate-400">({NumberFormatter.formatCount(count)})</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Sales Bar Chart - Admin Only */}
          {normalizedRole !== 'frontdesk' && (
          <div className="w-full">
            <Card className="w-full min-h-[400px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Bar Chart</CardTitle>
                <CardDescription className="text-sm text-gray-700 dark:text-gray-300">January - December {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-[200px] mb-4">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-full text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ChartContainer config={chartConfig} className="w-full h-[260px]">
                  <BarChart width={500} height={260} data={resvData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                      ticks={yTicks}
                      tickLine={false}
                      axisLine={false}
                      tickCount={7}
                      tickFormatter={(value) => NumberFormatter.formatCurrency(value)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-2 rounded-md shadow-lg border text-sm bg-background text-foreground">
                              <p className="font-medium">{payload[0].payload.month}</p>
                              <p>Sales: {NumberFormatter.formatCurrency(payload[0].payload.sales)}</p>
                              <p className="text-xs text-muted-foreground">Click to view details</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="var(--color-sales)"
                      radius={8}
                      onClick={handleBarClick}
                      style={{ cursor: 'pointer' }}
                      className="fill-blue-500 dark:fill-blue-400"
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="text-muted-foreground">
                  Total sales for the last 12 months
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Click on any bar to view detailed booking data for that month
                </div>
              </CardFooter>
            </Card>
          </div>
          )}

          {/* Detailed Booking Sales Modal */}
          <Dialog open={showDetailedModal} onOpenChange={setShowDetailedModal}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detailed Booking Sales - {selectedMonth} {selectedYear}
                </DialogTitle>
                <DialogDescription>
                  Complete breakdown of all booking sales for {selectedMonth} {selectedYear} with customer and room type information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {detailedBookingData.length > 0 ? (
                  <div className="grid gap-4">
                    {detailedBookingData.map((booking, index) => (
                      <Card key={booking.booking_id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Booking ID</Badge>
                              <span className="font-medium">{booking.booking_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Reference</Badge>
                              <span className="text-sm text-muted-foreground">{booking.reference_no}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm font-medium">Invoice Date</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {DateFormatter.formatDateOnly(booking.invoice_date)}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">Customer</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.customer_fname} {booking.customer_lname}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span className="text-sm font-medium">Room Type</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{booking.roomtype_name}</p>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-sm font-medium">Room Price</span>
                            </div>
                            <p className="text-sm font-bold text-green-600">{NumberFormatter.formatCurrency(booking.roomtype_price)}</p>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-sm font-medium">Billing Amount</span>
                            </div>
                            <p className="text-sm font-bold text-blue-600">{NumberFormatter.formatCurrency(booking.billing_total_amount)}</p>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-sm font-medium">Invoice Amount</span>
                            </div>
                            <p className="text-sm font-bold text-purple-600">{NumberFormatter.formatCurrency(booking.invoice_total_amount)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No booking data available for {selectedMonth} {selectedYear}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Available Room Types Modal */}
          <Dialog open={showAvailableTypesModal} onOpenChange={setShowAvailableTypesModal}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Available Room Types
                </DialogTitle>
                <DialogDescription>
                  Shows counts of currently available (Vacant) rooms per room type
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {Object.keys(availableByRoomType).length > 0 ? (
                  <div className="divide-y">
                    {Object.entries(availableByRoomType)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([typeName, count]) => (
                        <div key={typeName} className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {typeName}
                          </span>
                          <Badge variant="outline" className="text-slate-700 dark:text-slate-300">
                            {NumberFormatter.formatCount(count)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No available rooms found.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>
