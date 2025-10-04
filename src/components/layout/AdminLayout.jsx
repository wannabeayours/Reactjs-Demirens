import React from 'react'
import AdminHeader from './AdminHeader'

function AdminLayout({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      <main className={`lg:ml-72 p-4 space-y-6 ${className}`}>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout

