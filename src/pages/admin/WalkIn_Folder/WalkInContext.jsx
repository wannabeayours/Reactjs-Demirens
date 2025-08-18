import React, { createContext, useState, useContext } from 'react';

const WalkInContext = createContext();

export const WalkInProvider = ({ children }) => {
  const [walkInData, setWalkInData] = useState({
    // Step 1: Customer Info
    nationality_id: '',
    identification_id: null,
    customers_fname: '',
    customers_lname: '',
    customers_email: '',
    customers_phone_number: '',
    customers_date_of_birth: '',
    customers_address: '',

    // Step 2: Selected Room
    selectedRoom: null, // will store the full room object

    // Step 3: Payment Info
    payment: {
      method: '',     // cash, card, gcash, etc.
      amountPaid: 0,
      discount: 0,
      referenceNumber: '' // for digital payments
    }
  });

  return (
    <WalkInContext.Provider value={{ walkInData, setWalkInData }}>
      {children}
    </WalkInContext.Provider>
  );
};

export const useWalkIn = () => useContext(WalkInContext);
