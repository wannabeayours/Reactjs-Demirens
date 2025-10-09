import React, { useState } from 'react'
import MoneyCard, { RevenueCard, TransactionCard, ProfitCard } from './MoneyCard'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp, Calendar, DollarSign as DollarSignIcon, Activity, Bed, Coffee } from "lucide-react"

/**
 * MoneyCard Examples and Usage Guide
 * This file demonstrates various ways to use the MoneyCard component
 */

const MoneyCardExamples = () => {
  const [stats, setStats] = useState({
    today: {
      total_transactions: 15,
      total_amount_today: 125000.50
    },
    week: {
      total_transactions: 89,
      total_amount_week: 750000.25
    },
    month: {
      total_transactions: 342,
      total_amount_month: 2100000.75
    }
  })

  // Example breakdown data
  const revenueBreakdown = [
    {
      label: "Room Bookings",
      value: 1800000,
      count: 298,
      countLabel: "bookings",
      percentage: 85.7,
      type: "revenue"
    },
    {
      label: "Amenity Requests",
      value: 150000.25,
      count: 44,
      countLabel: "requests",
      percentage: 7.1,
      type: "revenue"
    },
    {
      label: "Additional Services",
      value: 150000.50,
      count: 12,
      countLabel: "services",
      percentage: 7.2,
      type: "revenue"
    }
  ]

  const transactionBreakdown = [
    {
      label: "Today",
      value: stats.today.total_transactions,
      count: stats.today.total_transactions,
      countLabel: "transactions",
      type: "activity"
    },
    {
      label: "This Week",
      value: stats.week.total_transactions,
      count: stats.week.total_transactions,
      countLabel: "transactions",
      type: "activity"
    },
    {
      label: "This Month",
      value: stats.month.total_transactions,
      count: stats.month.total_transactions,
      countLabel: "transactions",
      type: "activity"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MoneyCard Component Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This component provides a consistent way to display monetary values with overflow handling
            and detailed breakdown modals across all admin pages.
          </p>
        </CardContent>
      </Card>

      {/* Basic Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Basic MoneyCard */}
          <MoneyCard
            title="Total Revenue"
            amount={2100000.75}
            subtitle="All time revenue"
            icon={DollarSign}
          />

          {/* With Breakdown */}
          <MoneyCard
            title="Today's Revenue"
            amount={stats.today.total_amount_today}
            subtitle="Today's transactions"
            icon={Clock}
            breakdownItems={revenueBreakdown}
          />

          {/* Transaction Count */}
          <TransactionCard
            title="Total Transactions"
            amount={stats.month.total_transactions}
            subtitle="This month"
            icon={Activity}
            breakdownItems={transactionBreakdown}
          />

          {/* Profit Card */}
          <ProfitCard
            title="Net Profit"
            amount={175000.50}
            subtitle="After expenses"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Advanced Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Advanced Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Custom Colors */}
          <MoneyCard
            title="Room Revenue"
            amount={1800000}
            subtitle="Room bookings only"
            icon={Bed}
            iconColor="text-blue-600"
            amountColor="text-blue-600"
            breakdownItems={[
              { label: "Single Rooms", value: 450000, count: 120, type: "revenue" },
              { label: "Double Rooms", value: 720000, count: 180, type: "revenue" },
              { label: "Family Rooms", value: 630000, count: 105, type: "revenue" }
            ]}
          />

          {/* Custom Breakdown Title */}
          <MoneyCard
            title="Amenity Revenue"
            amount={150000.25}
            subtitle="Additional services"
            icon={Coffee}
            iconColor="text-orange-600"
            amountColor="text-orange-600"
            breakdownTitle="Amenity Service Breakdown"
            breakdownItems={[
              { label: "Room Service", value: 75000, count: 25, type: "revenue" },
              { label: "Spa Services", value: 45000.25, count: 12, type: "revenue" },
              { label: "Laundry", value: 30000, count: 7, type: "revenue" }
            ]}
          />

          {/* Without Expand Button */}
          <MoneyCard
            title="Quick Stats"
            amount={342}
            subtitle="Total bookings this month"
            icon={Calendar}
            showExpandButton={false}
            amountColor="text-purple-600"
          />
        </div>
      </div>

      {/* Loading State Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loading State Example</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MoneyCard
            title="Loading Example"
            amount={0}
            subtitle="This shows loading state"
            icon={DollarSign}
            isLoading={true}
          />
          <MoneyCard
            title="Loaded Example"
            amount={2100000.75}
            subtitle="This shows loaded state"
            icon={DollarSign}
            isLoading={false}
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Basic Import:</h3>
            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              import MoneyCard, {`{ RevenueCard, TransactionCard, ProfitCard }`} from './Function_Files/MoneyCard'
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Basic Usage:</h3>
            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {`<MoneyCard
  title="Total Revenue"
  amount={2100000.75}
  subtitle="All time revenue"
  icon={DollarSign}
/>`}
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">With Breakdown:</h3>
            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {`<MoneyCard
  title="Today's Revenue"
  amount={125000.50}
  breakdownItems={[
    { label: "Room Bookings", value: 100000, count: 25, type: "revenue" },
    { label: "Amenities", value: 25000.50, count: 12, type: "revenue" }
  ]}
/>`}
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Props Available:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><strong>title:</strong> Card title text</li>
              <li><strong>amount:</strong> Numeric amount to display</li>
              <li><strong>subtitle:</strong> Subtitle text below amount</li>
              <li><strong>icon:</strong> Lucide React icon component</li>
              <li><strong>iconColor:</strong> Tailwind color class for icon</li>
              <li><strong>amountColor:</strong> Tailwind color class for amount text</li>
              <li><strong>isLoading:</strong> Boolean to show loading state</li>
              <li><strong>breakdownItems:</strong> Array of breakdown items</li>
              <li><strong>breakdownTitle:</strong> Modal title for breakdown</li>
              <li><strong>showExpandButton:</strong> Boolean to show/hide expand button</li>
              <li><strong>onClick:</strong> Function to handle card click</li>
              <li><strong>tooltip:</strong> Tooltip text for expand button</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MoneyCardExamples

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>
