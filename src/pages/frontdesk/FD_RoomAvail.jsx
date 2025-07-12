import React from 'react'
import FrontHeader from '@/components/layout/FrontHeader'

function FD_RoomAvail() {
 const APIConn = `${localStorage.url}front-desk.php`;

 return (
  <>
   <FrontHeader />
   <div>Frontdesk Room Availability</div>
  </>
 )
}

export default FD_RoomAvail