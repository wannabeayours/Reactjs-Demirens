import React, { useEffect, useRef } from "react";

export default function CreditCard({ onSubmit, totalAmount }) {
  const paypal = useRef();
  useEffect(() => {
    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      fundingSource: window.paypal.FUNDING.PAYPAL, // ✅ Only show PayPal option

      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Demiren Booking`,
            amount: {
              currency_code: 'PHP',
              value: totalAmount
            }
          }]
        });
      },
      onApprove: async (data, actions) => {
        // const details = await actions.order.capture();
        onSubmit()
      },
      onError: (err) => {
        console.log(err);
      }
    }).render(paypal.current);
  }, []);


  return (
    <>
      <div ref={paypal}></div>
    </>
  );
}
