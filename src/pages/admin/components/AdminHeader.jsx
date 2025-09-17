import React from 'react'
import ThemeToggle from '../../../components/layout/ThemeToggle'
import Sidebar from './Sidebar'

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
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">DEMIREN HOTEL AND RESTAURANT</h1>
            <ThemeToggle />
          </div>
        </div>

      </div>
    </div>

  )
}

export default AdminHeader