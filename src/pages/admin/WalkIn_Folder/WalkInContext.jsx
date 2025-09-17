import React, { createContext, useState, useContext } from 'react';

const WalkInContext = createContext();

export const WalkInProvider = ({ children }) => {
  const [walkInData, setWalkInData] = useState({
    // Step 1: Booking Details
    checkIn: '',
    checkOut: '',
    adult: 1,
    children: 0,
    selectedRooms: [], // Array of selected rooms

    // Step 2: Customer Info
    nationality_id: '',
    identification_id: null,
    customers_fname: '',
    customers_lname: '',
    customers_email: '',
    customers_phone_number: '',
    customers_date_of_birth: '',
    customers_address: '',

    // Step 3: Payment Info
    payment: {
      method: '',     // cash, card, gcash, etc.
      amountPaid: 0,
      discount: 0,
      referenceNumber: '' // for digital payments
    },

    // Step 4: Billing Info
    billing: {
      roomRate: 0,
      subtotal: 0,
      vat: 0,
      total: 0,
      nights: 0
    }
  });

  return (
    <WalkInContext.Provider value={{ walkInData, setWalkInData }}>
      {children}
    </WalkInContext.Provider>
  );
};

export const useWalkIn = () => useContext(WalkInContext);
