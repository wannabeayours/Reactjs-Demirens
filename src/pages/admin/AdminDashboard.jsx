import { Card } from '@/components/ui/card'
import React from 'react'

function AdminDashboard() {
  localStorage.setItem("role", "admin");
  return (
    <div>
      <Card>
        <div className='p-4'>
        AdminDashboard
        </div>
      
      </Card>
      
      </div>
  )
}

export default AdminDashboard