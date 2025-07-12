import { Card } from '@/components/ui/card'
import AdminHeader from '@/components/layout/AdminHeader';
import React from 'react'


function AdminDashboard() {
  localStorage.setItem("role", "admin");
  return (
    <div>
      <AdminHeader/>
      <Card>
        <div className='p-4'>
        AdminDashboard
        </div>
      
      </Card>
      
      </div>
  )
}

export default AdminDashboard