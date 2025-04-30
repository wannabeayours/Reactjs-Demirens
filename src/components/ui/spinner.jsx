import { Loader2 } from 'lucide-react'
import React from 'react'

function Spinner() {
  return (
    <>
      <div className="flex justify-center items-center ">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    </>
  )
}

export default Spinner