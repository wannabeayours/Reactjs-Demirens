import React from 'react'
import ThemeToggle from '../../../components/layout/ThemeToggle'
import Sidebar from './Sidebar'
import { Bell } from 'lucide-react'  // import Bell icon

function AdminHeader({ onCollapse }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Sidebar on the left */}
      <div className="mr-4">
        <Sidebar onCollapse={onCollapse} />
      </div>

      {/* Header text and theme toggle on the right */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              DEMIREN HOTEL AND RESTAURANT
            </h1>

            {/* Notification bell */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {/* Notification dot */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHeader
