'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Loader2, CreditCard, Truck, Smartphone, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Meghalaya',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
      if (data) {
        setStoreSettings(data);
      } else {
        setStoreSettings({ tax_rate: 5, shipping_local: 50, shipping_regional: 80, shipping_national: 120, free_shipping_threshold: 1500 });
      }
    };
    fetchSettings();
  }, []);

  // Calculation Logic
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxRate = (storeSettings?.tax_rate || 5) / 100;
  const taxAmount = Math.round(subtotal * taxRate);

  let shippingCost = 0;
  if (formData.state === 'Meghalaya') {
    shippingCost = storeSettings?.shipping_local || 50;
  } else if (['Assam', 'Manipur', 'Nagaland', 'Tripura', 'Mizoram', 'Arunachal Pradesh'].includes(formData.state)) {
    shippingCost = storeSettings?.shipping_regional || 80;
  } else {
    shippingCost = storeSettings?.shipping_national || 120;
  }

  const freeShippingLimit = storeSettings?.free_shipping_threshold || 1500;
  if (subtotal >= freeShippingLimit) {
    shippingCost = 0;
  }

  const total = subtotal + taxAmount + shippingCost;

  // --- RAZORPAY PAYMENT ENGINE ---
  const handlePayment = async (savedOrderId: string) => {
    try {
      // 1. Create the order on your server API
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      
      const order = await res.json();

      if (!order.id) {
        throw new Error(order.error || "Failed to create Razorpay order");
      }

      // 2. Configure Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "Lec Delights",
        description: `Order ID: ${savedOrderId}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Runs only on SUCCESS
          console.log("Payment Success ID:", response.razorpay_payment_id);
          
          // Update order status in Supabase if needed
          await supabase.from('orders').update({ status: 'Paid' }).eq('id', savedOrderId);
          
          clearCart();
          alert("Snacks secured! Payment Successful.");
          router.push('/'); 
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#7fae45" }, // Matching your brand green
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment Init Error:", err);
      alert("Payment Error: " + err.message);
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderData = {
      customer_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      items: items,
      subtotal: subtotal,
      tax: taxAmount,
      shipping: shippingCost,
      total: total,
      payment_method: paymentMethod,
      status: 'Awaiting Payment'
    };

    // 1. Save order to Supabase first
    const { data: savedOrder, error } = await supabase.from('orders').insert([orderData]).select().single();

    if (error) {
      setIsProcessing(false);
      alert("Database Error: " + error.message);
      return;
    }

    // 2. Send initial receipt email
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedOrder),
      });
    } catch (e) {
      console.error("Email failed but order saved.");
    }

    // 3. Trigger the Real Razorpay Popup
    await handlePayment(savedOrder.id);
  };

  if (!mounted || !storeSettings) return (
    <div className="min-h-screen bg-[#fafaf9] pt-40 pb-24 flex justify-center">
      <Loader2 className="animate-spin text-[var(--color-primary)] w-10 h-10" />
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] pt-40 pb-24 px-6 flex flex-col items-center text-center">
        <Truck className="w-16 h-16 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products" className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold">
          Shop Snacks
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-32 pb-24 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-7xl mx-auto">
        <Link href="/products" className="flex items-center gap-2 text-gray-500 font-bold mb-8 uppercase text-xs tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form Side */}
          <div className="w-full lg:w-3/5 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-serif font-bold mb-8">Shipping Details</h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" />
                <input required placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" />
                <input required type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" />
                <input required type="tel" placeholder="Phone" name="phone" value={formData.phone} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" />
                <input required placeholder="Address" name="address" className="md:col-span-2 p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" value={formData.address} onChange={handleChange} />
                <input required placeholder="City" name="city" value={formData.city} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" />
                <select name="state" value={formData.state} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none">
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Assam">Assam</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Other">Other</option>
                </select>
                <input required placeholder="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[var(--color-primary)]" />
              </form>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <label className="flex items-center p-5 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 cursor-pointer">
                <Smartphone className="w-6 h-6 text-[var(--color-primary)]" />
                <div className="ml-4">
                  <span className="block font-bold">UPI / QR Code</span>
                  <span className="block text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                </div>
              </label>
            </div>
          </div>

          {/* Summary Side */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-32">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{taxAmount}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between items-center mb-8">
                <span className="font-bold text-lg">Total</span>
                <span className="text-3xl font-bold text-[var(--color-primary)]">₹{total}</span>
              </div>
              <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-[var(--color-primary)] text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : `Pay ₹${total}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}