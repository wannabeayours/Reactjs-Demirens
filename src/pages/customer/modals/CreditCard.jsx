import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function CreditCard({ onSubmit, totalAmount, isRoomAvailable }) {
  const paypal = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const initializePayPal = async () => {
    try {
      // Check if PayPal SDK is loaded
      if (!window.paypal) {
        throw new Error("PayPal SDK not loaded");
      }

      setIsLoading(true);
      setHasError(false);

      const buttons = window.paypal.Buttons({
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

            return actions.order.create({
              purchase_units: [{
                description: `Demiren Booking`,
                amount: {
                  currency_code: 'PHP',
                  value: totalAmount
                }
              }]
            });
          } catch (e) {
            console.error("PayPal createOrder error:", e);
            toast.error("Failed to create PayPal order. Please try again.");
            throw e;
          }
        },
        onApprove: async (data, actions) => {
          try {
            // const details = await actions.order.capture();
            toast.success("Payment successful!");
            onSubmit();
          } catch (error) {
            console.error("PayPal approval error:", error);
            toast.error("Payment processing failed. Please try again.");
          }
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          
          // Handle specific error types
          if (err.message && err.message.includes('blocked')) {
            toast.error("PayPal request blocked. Please disable ad blockers and try again.");
          } else if (err.message && err.message.includes('network')) {
            toast.error("Network error. Please check your internet connection.");
          } else {
            toast.error("PayPal error occurred. Please try again or use an alternative payment method.");
          }
          
          setHasError(true);
        },
        onCancel: (data) => {
          console.log("PayPal payment cancelled:", data);
          toast.info("Payment cancelled");
        }
      });

      // Clear previous content and render new buttons
      if (paypal.current) {
        paypal.current.innerHTML = '';
        await buttons.render(paypal.current);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("PayPal initialization error:", error);
      setHasError(true);
      setIsLoading(false);
      
      if (error.message.includes('PayPal SDK not loaded')) {
        toast.error("PayPal service unavailable. Please refresh the page or try again later.");
      } else {
        toast.error("Failed to initialize PayPal. Please try again.");
      }
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      initializePayPal();
    } else {
      toast.error("Maximum retry attempts reached. Please refresh the page or contact support.");
    }
  };

  useEffect(() => {
    // Add a small delay to ensure PayPal SDK is fully loaded
    const timer = setTimeout(() => {
      initializePayPal();
    }, 100);

    return () => clearTimeout(timer);
  }, [totalAmount]);


  return (
    <div className="paypal-container">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading PayPal...</span>
        </div>
      )}
      
      {hasError && (
        <div className="text-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
            <p className="text-red-600 text-sm">
              PayPal failed to load. This might be due to:
            </p>
            <ul className="text-red-600 text-xs mt-2 list-disc list-inside">
              <li>Ad blockers or browser extensions</li>
              <li>Network connectivity issues</li>
              <li>Browser privacy settings</li>
            </ul>
          </div>
          
          {retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Retry PayPal ({retryCount + 1}/{maxRetries})
            </button>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Troubleshooting tips:</p>
            <p>• Disable ad blockers for this site</p>
            <p>• Try a different browser</p>
            <p>• Check your internet connection</p>
          </div>
        </div>
      )}
      
      <div 
        ref={paypal} 
        style={{ 
          display: isLoading || hasError ? 'none' : 'block',
          minHeight: '200px'
        }}
      ></div>
    </div>
  );
}
