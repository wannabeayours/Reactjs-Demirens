import React, { useState, useEffect } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios';

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

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import { toast } from 'sonner';

function AdminDashboard() {
  const APIConn = `${localStorage.url}admin.php`;
  localStorage.setItem("role", "admin");

  const [resvData, setResvData] = useState({})
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  const gatherBooking = async (yearToFilter = new Date().getFullYear()) => {
    try {
      const formData = new FormData();
      formData.append("method", "getAllInvoices");

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

        const chartReadyData = Object.entries(monthMap).map(([month, count]) => ({
          month,
          desktop: count,
          total: monthTotalMap[month],
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

  const chartConfig = {
    desktop: {
      label: "Sales",
      color: "var(--chart-1)",
    },
  }

  useEffect(() => {
    gatherBooking(selectedYear);
  }, [selectedYear]);

  return (
    <>
      <div>
        <AdminHeader />

        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-semibold">Admin Name Here</h1>

          {/* Bar Chart Section */}
          <section>
            <label htmlFor="GraphGroup" className="block mb-2 font-medium">
              Graphs
            </label>
            <div id="GraphGroup" className="w-full">
              <Card className="w-full min-h-[400px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Bar Chart</CardTitle>
                  <CardDescription className="text-sm">January - December 2024</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="w-[200px] mb-4">
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2025, 2024, 2023].map((year) => (
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
                                <p>Bookings: {payload[0].payload.desktop}</p>
                                <p>Sales: ₱{payload[0].payload.total}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                    </BarChart>

                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Total visitors for the last 12 months
                  </div>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Simple Reports Section */}
          <section>
            <label htmlFor="CardGroup" className="block mb-2 font-medium">
              Simple Reports
            </label>
            <div id="CardGroup" className="flex flex-wrap gap-4">

              <div className="w-full sm:w-[48%] lg:w-[calc(25%-1rem)]">
                <Card className="min-h-[150px]">
                  <CardHeader>
                    <CardTitle>Rooms</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
              </div>

              <div className="w-full sm:w-[48%] lg:w-[calc(25%-1rem)]">
                <Card className="min-h-[150px]">
                  <CardHeader>
                    <CardTitle>Booking</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
              </div>

              <div className="w-full sm:w-[48%] lg:w-[calc(25%-1rem)]">
                <Card className="min-h-[150px]">
                  <CardHeader>
                    <CardTitle>Available Rooms</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
              </div>

              <div className="w-full sm:w-[48%] lg:w-[calc(25%-1rem)]">
                <Card className="min-h-[150px]">
                  <CardHeader>
                    <CardTitle>Payments</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
              </div>

            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
