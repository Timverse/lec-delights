"use client";
import Script from 'next/script';
import { useState } from 'react';

export default function PaymentButton({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!(window as any).Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      const order = await res.json();
      if (!order.id) throw new Error("Failed to create order");

      const options = {
        // FIXED: Using the variable name, not the value
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "Lec Delights",
        description: "Order for Premium Banana Chips",
        order_id: order.id,
        handler: function (response: any) {
          alert("Payment Successful! ID: " + response.razorpay_payment_id);
          // Add your clearCart() or redirect logic here
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#FBBF24",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment failed:", error);
      alert("Something went wrong with the payment initialization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
      />
      
      <button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold hover:bg-yellow-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
      >
        {loading ? "Initializing..." : `Pay ₹${amount} with UPI`}
      </button>
    </>
  );
}