import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

function ResponsiveTable({ children, className = "", minWidth = "800px" }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table className={`min-w-[${minWidth}]`}>
        {children}
      </Table>
    </div>
  )
}

export default ResponsiveTable

