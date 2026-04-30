"use client";
import Script from 'next/script';
import { useState } from 'react';

export default function PaymentButton({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create the order by calling our backend API
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      const order = await res.json();

      if (!order.id) throw new Error("Failed to create order");

      // 2. Configure the Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your rzp_test_... key
        amount: order.amount,
        currency: order.currency,
        name: "Lec Delights",
        description: "Order for Premium Banana Chips",
        order_id: order.id,
        handler: function (response: any) {
          // This runs after a successful payment
          alert("Payment Successful!");
          console.log("Payment ID:", response.razorpay_payment_id);
          // Logic: Redirect user to /success or update database
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#FBBF24", // A nice gold/yellow to match banana chips!
        },
      };

      // 3. Open the Razorpay Window
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
      {/* This loads the Razorpay SDK securely */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
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