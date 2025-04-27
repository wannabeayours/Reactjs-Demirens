import { Button } from '@/components/ui/button';
import React from 'react'
import { Link } from 'react-router-dom'

function AdminReviews() {
  return (
    <Link to="/login"> 
    <Button>Go to Login</Button>
  </Link>
  )
}

export default AdminReviews