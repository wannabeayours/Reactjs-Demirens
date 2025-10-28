import React, { createContext, useState, useContext, useEffect } from 'react';

const WalkInContext = createContext();

const initialWalkInData = {
  // Step 1: Booking Details
  checkIn: '',
  checkOut: '',
  adult: 1,
  children: 0,
  selectedRooms: [], // Array of selected rooms
  selectedRoomTypes: [], // Array of selected room type IDs

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
};

export const WalkInProvider = ({ children }) => {
  const [walkInData, setWalkInData] = useState(() => {
    try {
      const saved = localStorage.getItem('walkInData');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic shape validation
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    return initialWalkInData;
  });

  // Persist automatically on any change
  useEffect(() => {
    try {
      localStorage.setItem('walkInData', JSON.stringify(walkInData));
    } catch (_) {}
  }, [walkInData]);

  const resetWalkIn = () => {
    try { localStorage.removeItem('walkInData'); } catch (_) {}
    setWalkInData(initialWalkInData);
  };

  return (
    <WalkInContext.Provider value={{ walkInData, setWalkInData, resetWalkIn }}>
      {children}
    </WalkInContext.Provider>
  );
};

export const useWalkIn = () => useContext(WalkInContext);
