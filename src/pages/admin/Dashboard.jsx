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

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, Calendar, DollarSign as DollarSignIcon, User, Building, X } from "lucide-react"
import { toast } from 'sonner';

function AdminDashboard() {
  const APIConn = `${localStorage.url}admin.php`;
  localStorage.setItem("role", "admin");

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
  const statusColorMap = {
    Occupied: '#ef4444', // red-500
    Pending: '#f59e0b',  // amber-500
    Vacant: '#22c55e',   // green-500
    'Under-Maintenance': '#64748b', // slate-500
    Dirty: '#a855f7',    // purple-500
  }

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
      formData.append("method", "getActiveBookingsForDashboard");

      const res = await axios.post(APIConn, formData);
      
      if (res.data && !res.data.error) {
        setActiveBookings(res.data);
      } else {
        setActiveBookings({});
      }
    } catch (error) {
      console.error("Failed to fetch active bookings:", error);
      setActiveBookings({});
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
        res.data.forEach((room) => {
          const status = room.status_name || 'Unknown';
          const typeName = room.roomtype_name || 'Unknown';
          // Global status distribution
          counts[status] = (counts[status] || 0) + 1;
          // Available by room type (Vacant only)
          if ((room.status_name || '').toLowerCase() === 'vacant') {
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

  useEffect(() => {
    gatherBooking(selectedYear);
    fetchActiveBookings();
    fetchAvailableRooms();
    fetchRoomStatusDistribution();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchActiveBookings();
      fetchAvailableRooms();
      fetchRoomStatusDistribution();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedYear]);

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Name Here</h1>

          

          {/* Real-Time Reports Section */}
          <section>
            <label htmlFor="CardGroup" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
              Real-Time Reports
            </label>
            <div id="CardGroup" className="flex flex-wrap gap-4">

              {/* Active Bookings Card */}
              <div className="w-full sm:w-[48%] lg:w-[calc(50%-1rem)]">
                <Card className="min-h-[150px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Active Bookings
                      </CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        Live
                      </Badge>
                    </div>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Current guests in hotel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                          {NumberFormatter.formatCount(activeBookings.active_bookings_count || 0)}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Active Bookings
                        </div>
                      </div>
                  </CardContent>
                </Card>
              </div>

              {/* Room Status Distribution Card */}
              <div className="w-full sm:w-[48%] lg:w-[calc(50%-1rem)]">
                <Card className="min-h-[150px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Room Status Distribution
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                          Live
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setShowAvailableTypesModal(true)}
                          title="Show available room types"
                        >
                          ...
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      Segmented by current status from tbl_status_types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {(() => {
                      const entries = Object.entries(roomStatusCounts);
                      const total = entries.reduce((sum, [, count]) => sum + count, 0);
                      return (
                        <div>
                          {/* Segmented Bar */}
                          <div className="w-full h-6 rounded-md overflow-hidden flex">
                            {entries.length > 0 && total > 0 ? (
                              entries.map(([status, count]) => (
                                <div
                                  key={status}
                                  title={`${status}: ${count}`}
                                  style={{
                                    width: `${(count / total) * 100}%`,
                                    backgroundColor: statusColorMap[status] || '#94a3b8',
                                  }}
                                  className="h-full"
                                />
                              ))
                            ) : (
                              <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                            )}
                          </div>

                          {/* Legend */}
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {entries.length > 0 ? (
                              entries.map(([status, count]) => (
                                <div key={status} className="flex items-center gap-2 text-sm">
                                  <span
                                    className="inline-block h-3 w-3 rounded"
                                    style={{ backgroundColor: statusColorMap[status] || '#94a3b8' }}
                                  />
                                  <span className="text-slate-800 dark:text-slate-200">
                                    {status}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400">({NumberFormatter.formatCount(count)})</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-sm text-muted-foreground">No room status data</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
              </Card>
              </div>

              {/* Room Types Status Cards */}
              <div className="w-full">
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Room Types Overview</CardTitle>
                    <CardDescription className="text-sm text-gray-700 dark:text-gray-300">
                      Per-type room counts by current status
                    </CardDescription>
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
                                    <Badge variant="secondary" className="text-xs">{total} rooms</Badge>
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

              {/* Sales Bar Chart */}
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

            </div>
          </section>

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
