// src/admin/approval/ApprovalContext.jsx
import React, { createContext, useContext, useState } from "react";

const ApprovalContext = createContext(null);

export const ApprovalProvider = ({ children }) => {
  const [state, setState] = React.useState({
    bookingId: null,
    userId: (() => {
      const keys = ["user_id", "userId", "userID", "admin_id", "employee_id", "employeeId"];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return v;
      }
      return null;
    })(),
    customerName: null,
    checkIn: null,
    checkOut: null,
    nights: 0,
    requestedRoomTypes: [],
    requestedRoomCount: 0,
    selectedRooms: [],
    totals: { subtotal: 0, vat: 0, grandTotal: 0, downpayment: 0 },
  });

  const value = React.useMemo(() => ({ state, setState }), [state]);
  return <ApprovalContext.Provider value={value}>{children}</ApprovalContext.Provider>;
};

export const useApproval = () => {
  const ctx = useContext(ApprovalContext);
  if (!ctx) throw new Error("useApproval must be used within ApprovalProvider");
  return ctx;
};
