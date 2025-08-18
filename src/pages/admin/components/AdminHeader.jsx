import React from 'react'
import ThemeToggle from '../../../components/layout/ThemeToggle'
import Sidebar from './Sidebar'

function AdminHeader() {
  return (
    <div className="flex justify-between items-center p-4 ">
      {/* Sidebar on the left */}
      <div className="mr-4">
        <Sidebar />
      </div>

      {/* Header text and theme toggle on the right */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">DEMIREN HOTEL AND RESTAURANT</h1>
            <ThemeToggle />
          </div>
        </div>

      </div>
    </div>

  )
}

export default AdminHeader