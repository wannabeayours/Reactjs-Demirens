import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Maximize2, DollarSign as DollarSignIcon, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { NumberFormatter } from './NumberFormatter'

/**
 * MoneyCard Component
 * A reusable component for displaying monetary values in admin cards with overflow handling
 * and detailed breakdown modals
 */
const MoneyCard = ({
  title,
  amount,
  subtitle,
  icon: Icon = DollarSign,
  iconColor = "text-muted-foreground",
  amountColor = "text-green-600",
  isLoading = false,
  breakdown = null,
  breakdownTitle = "Revenue Breakdown",
  breakdownItems = [],
  showExpandButton = true,
  className = "",
  cardClassName = "",
  onClick = null,
  tooltip = null
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Format amount using NumberFormatter
  const formatAmount = (value) => {
    if (!value && value !== 0) return NumberFormatter.formatCurrency(0)
    return NumberFormatter.formatCurrency(value)
  }

  // Get breakdown icon based on breakdown type
  const getBreakdownIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'revenue':
      case 'income':
      case 'profit':
        return DollarSign
      case 'growth':
      case 'increase':
        return TrendingUp
      case 'decrease':
      case 'loss':
        return TrendingDown
      default:
        return Activity
    }
  }

  // Render breakdown items
  const renderBreakdownItems = () => {
    if (breakdownItems.length === 0 && !breakdown) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No breakdown data available</p>
        </div>
      )
    }

    const items = breakdownItems.length > 0 ? breakdownItems : [
      { label: title, value: amount, count: null }
    ]

    return (
      <div className="space-y-3">
        {items.map((item, index) => {
          const ItemIcon = getBreakdownIcon(item.type)
          return (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <ItemIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                  {item.count !== null && item.count !== undefined && (
                    <p className="text-sm text-gray-500">{item.count} {item.countLabel || 'items'}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatAmount(item.value)}</p>
                {item.percentage && (
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  // Main card content
  const cardContent = (
    <Card className={`${cardClassName} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div 
                className={`text-2xl font-bold ${amountColor} truncate overflow-hidden flex-1`}
                title={formatAmount(amount)}
              >
                {formatAmount(amount)}
              </div>
              {showExpandButton && (breakdown || breakdownItems.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowBreakdown(true)
                  }}
                  className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900 flex-shrink-0"
                  title={tooltip || "View detailed breakdown"}
                >
                  <Maximize2 className="h-3 w-3 text-green-600" />
                </Button>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className={className}>
      {onClick ? (
        <div onClick={handleCardClick}>
          {cardContent}
        </div>
      ) : (
        cardContent
      )}

      {/* Breakdown Modal */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {breakdownTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Total Summary */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatAmount(amount)}
              </div>
              <p className="text-sm text-gray-500">Total {title.toLowerCase()}</p>
            </div>
            
            {/* Breakdown Items */}
            {renderBreakdownItems()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * RevenueCard - Specialized version for revenue display
 */
export const RevenueCard = (props) => (
  <MoneyCard
    {...props}
    icon={DollarSign}
    iconColor="text-green-600"
    amountColor="text-green-600"
    breakdownTitle="Revenue Breakdown"
  />
)

/**
 * TransactionCard - Specialized version for transaction counts
 */
export const TransactionCard = (props) => (
  <MoneyCard
    {...props}
    icon={Activity}
    iconColor="text-blue-600"
    amountColor="text-blue-600"
    breakdownTitle="Transaction Breakdown"
    formatAmount={(value) => NumberFormatter.formatCount(value)}
  />
)

/**
 * ProfitCard - Specialized version for profit/loss display
 */
export const ProfitCard = ({ amount, ...props }) => {
  const isProfit = amount >= 0
  return (
    <MoneyCard
      {...props}
      amount={Math.abs(amount)}
      icon={isProfit ? TrendingUp : TrendingDown}
      iconColor={isProfit ? "text-green-600" : "text-red-600"}
      amountColor={isProfit ? "text-green-600" : "text-red-600"}
      breakdownTitle={isProfit ? "Profit Breakdown" : "Loss Breakdown"}
      subtitle={props.subtitle || (isProfit ? "Net profit" : "Net loss")}
    />
  )
}

export default MoneyCard

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>
