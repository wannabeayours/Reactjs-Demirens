import React, { useState, useEffect } from 'react'
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

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp, Calendar, DollarSign, User, Building, X } from "lucide-react"
import { toast } from 'sonner';

function AdminDashboard() {
  const APIConn = `${localStorage.url}admin.php`;
  localStorage.setItem("role", "admin");

  const [resvData, setResvData] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [detailedBookingData, setDetailedBookingData] = useState([])
  const [showDetailedModal, setShowDetailedModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [activeBookings, setActiveBookings] = useState({})
  const [availableRooms, setAvailableRooms] = useState({})


  const gatherBooking = async (yearToFilter = new Date().getFullYear()) => {
    try {
      const formData = new FormData();
      formData.append("method", "getInvoiceDatas");

      const res = await axios.post(APIConn, formData);
      if (res.data && Array.isArray(res.data)) {
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
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchActiveBookings();
      fetchAvailableRooms();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedYear]);

  return (
    <>
      <div>
        <AdminHeader />

        <div className="ml-0 lg:ml-72 p-4 space-y-6 text-gray-900 dark:text-white">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Name Here</h1>

          {/* Bar Chart Section */}
          <section>
            <label htmlFor="GraphGroup" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
              Graphs
            </label>
            <div id="GraphGroup" className="w-full">
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
                        {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
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
                  <div className="flex items-center gap-2 font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Total sales for the last 12 months
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Click on any bar to view detailed booking data for that month
                  </div>
                </CardFooter>
              </Card>
            </div>
          </section>

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

              {/* Available Rooms Card */}
              <div className="w-full sm:w-[48%] lg:w-[calc(50%-1rem)]">
                <Card className="min-h-[150px] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Available Rooms
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Live
                      </Badge>
                    </div>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      Rooms ready for booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-900 dark:text-green-100 mb-2">
                          {NumberFormatter.formatCount(availableRooms.total_available_rooms || 0)}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Available Rooms
                        </div>
                      </div>
                  </CardContent>
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
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
