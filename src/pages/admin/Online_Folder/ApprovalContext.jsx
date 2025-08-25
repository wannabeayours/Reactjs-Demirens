// src/admin/approval/ApprovalContext.jsx
import React, { createContext, useContext, useState } from "react";

const ApprovalContext = createContext(null);

export const ApprovalProvider = ({ children }) => {
  const [state, setState] = useState({
    // From list page
    bookingId: null,
    adminId: localStorage.getItem("admin_id") || null,
    customerName: "",
    checkIn: "", // ISO date string
    checkOut: "", // ISO date string
    nights: 0,

    // Request summary
    requestedRoomTypes: [], // [{id?: number, name: string}]
    requestedRoomCount: 0,  // number of rooms requested (booking.rooms.length)

    // Step 2: selected rooms (actual room numbers)
    selectedRooms: [], // [{ id: number, roomtype_name: string, price: number }]

    // Totals (computed on receipt step)
    totals: {
      subtotal: 0,
      vat: 0,
      grandTotal: 0,
    },
  });

  return (
    <ApprovalContext.Provider value={{ state, setState }}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => {
  const ctx = useContext(ApprovalContext);
  if (!ctx) throw new Error("useApproval must be used within ApprovalProvider");
  return ctx;
};
