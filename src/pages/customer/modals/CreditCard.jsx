import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function CreditCard({ onSubmit, totalAmount, isRoomAvailable }) {
  const paypal = useRef();
  useEffect(() => {
    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        fundingSource: window.paypal.FUNDING.PAYPAL,

        // Validate availability before creating the PayPal order
        createOrder: async (data, actions) => {
          try {
            if (typeof isRoomAvailable === 'function') {
              const result = await isRoomAvailable();
              const ok = Number(result) === 1 || result === true;
              if (!ok) {
                toast.error("Rooms not available anymore");
                throw new Error("Room availability check failed");
              }
            }
          } catch (e) {
            console.error("PayPal createOrder blocked:", e);
            throw e;
          }
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
    } catch (error) {
      toast.error("No Internet Connection")
    }
  }, []);


  return (
    <>
      <div ref={paypal}></div>
    </>
  );
}
