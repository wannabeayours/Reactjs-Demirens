import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../../../components/layout/ThemeToggle'
import Sidebar from './Sidebar'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import { toast } from 'sonner'

function AdminHeader({ onCollapse, notificationRefreshTrigger = 0, resetNotificationsOnPage = false }) {
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const APIConn = useMemo(() => `${localStorage.url}admin.php`, [])

  // Security check - redirect if not admin
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const userType = localStorage.getItem('userType')
    const userLevel = localStorage.getItem('userLevel')

    if (!userId || userType !== 'admin' || userLevel !== 'Admin') {
      console.log('Unauthorized access detected in AdminHeader')
      toast.error('Admin access required')
      navigate('/login')
    }
  }, [navigate])

  const fetchPendingCount = useCallback(async () => {
    try {
      const formData = new FormData()
      formData.append('method', 'get_pending_amenity_count')
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      if (result.success) {
        setPendingCount(result.pending_count || 0)
      } else {
        setPendingCount(0)
      }
    } catch (error) {
      console.error('Error fetching pending amenity count:', error)
      setPendingCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [APIConn])

  useEffect(() => {
    fetchPendingCount()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    
    return () => clearInterval(interval)
  }, [fetchPendingCount])

  // Watch for notification refresh trigger
  useEffect(() => {
    if (notificationRefreshTrigger > 0) {
      fetchPendingCount()
    }
  }, [notificationRefreshTrigger, fetchPendingCount])

  // Reset notifications when on the amenities page
  useEffect(() => {
    if (resetNotificationsOnPage && pendingCount > 0) {
      setPendingCount(0)
    }
  }, [resetNotificationsOnPage, pendingCount])

  // Function to refresh count when called from parent components
  // const refreshNotificationCount = useCallback(() => {
  //   fetchPendingCount()
  // }, [fetchPendingCount])

  // Handle bell click - navigate to amenities page and reset counter
  const handleBellClick = useCallback(() => {
    // Reset the notification count to 0
    setPendingCount(0)
    
    // Navigate to the AdminRequestedAmenities page
    navigate('/admin/requestedamenities')
  }, [navigate])

  // Remove useImperativeHandle as it's not needed and causing issues

  return (
    <div className="lg:ml-72 flex justify-between items-center p-3 lg:p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
      {/* Sidebar on the left */}
      <div className="mr-2 lg:mr-4">
        <Sidebar onCollapse={onCollapse} />
      </div>

      {/* Header text and theme toggle on the right */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-1 lg:gap-4">
            <h1 className="text-xs sm:text-sm lg:text-lg font-bold text-[#34699a] dark:text-white truncate">
              <span className="hidden lg:inline">DEMIREN HOTEL AND RESTAURANT</span>
              <span className="hidden sm:inline lg:hidden">DEMIREN HOTEL & RESTAURANT</span>
              <span className="sm:hidden">DEMIREN HOTEL</span>
            </h1>

            {/* Notification bell with proper positioning */}
            <div className="relative">
              <button 
                onClick={handleBellClick}
                className="relative p-1.5 lg:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                title="Pending Amenity Requests - Click to view"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-[#34699a] dark:text-gray-300" />
                
                {/* Notification badge - positioned absolutely */}
                {pendingCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:min-w-5 rounded-full px-0.5 lg:px-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white border-2 border-white dark:border-gray-900 shadow-lg animate-pulse"
                    variant="destructive"
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </Badge>
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-gray-400 animate-pulse"></div>
                )}
              </button>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHeader
